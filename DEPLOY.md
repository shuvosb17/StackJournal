# StackJournal — Deployment Guide

Full path from **folder on disk** → **live site** that refreshes every morning at **6:00 AM Bangladesh time**.

## Overview

```
Neon (Postgres)  ←  GitHub Actions (ingest @ 6 AM BD)
       ↑
Render Free (Go API)
       ↑
Vercel (Next.js web)  ←  you open this in the browser
```

| Layer | Role |
|-------|------|
| **Neon** | Postgres database (articles, categories, sources) |
| **GitHub Actions** | Runs `go run ./cmd/ingest` on a schedule |
| **Render** | Hosts the Go API (`apps/api`) |
| **Vercel** | Hosts the Next.js frontend (`apps/web`) |

---

## Step 0 — Prerequisites

Install / have ready:

- [Git](https://git-scm.com/)
- [Node.js 20+](https://nodejs.org/)
- [Go 1.25+](https://go.dev/dl/)
- Accounts (all free): **GitHub**, **Neon**, **Render**, **Vercel**

Confirm tools:

```powershell
git --version
node -v
go version
```

---

## Step 1 — Put the project on GitHub

> **Important:** Your parent folder `Fun Project` may already be a git repo for another project. Initialize git **inside** `StackJournal` so the GitHub repo root is this project only — not the whole `Fun Project` folder.

In PowerShell, from the project root:

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal"

git init
git add .
git commit -m "Initial commit: StackJournal personal engineering reading room"

# Create a repo on GitHub (empty, no README), then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/StackJournal.git
git push -u origin main
```

Or use GitHub Desktop / `gh repo create` if you prefer.

**Check:**

- Repo is visible on GitHub with `apps/`, `.github/`, etc. at the root
- `.env` files are **not** committed (`.gitignore` excludes them)

---

## Step 2 — Create the Neon database

1. Go to [neon.tech](https://neon.tech) → sign up → **Create project** (name: `stackjournal`).
2. Region: pick something close (e.g. Singapore / Mumbai if available).
3. Open **Dashboard → Connection details**.
4. Copy the **connection string** (looks like `postgresql://...@...neon.tech/neondb?sslmode=require`).

Save it somewhere private — this is your `DATABASE_URL`.

> Neon requires SSL. The connection string must include `?sslmode=require`.

---

## Step 3 — Local env files

### API

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal\apps\api"
copy .env.example .env
```

Edit `apps/api/.env`:

```env
PORT=8080
ENVIRONMENT=development
DATABASE_URL=postgresql://...your-neon-url...
CORS_ORIGIN=http://localhost:3000
INGEST_API_KEY=any-random-string
```

> `INGEST_API_KEY` is optional today — the ingest CLI and GitHub Actions only need `DATABASE_URL`.

### Web

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal\apps\web"
copy .env.local.example .env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
API_URL=http://localhost:8080/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000` locally. It is **required on Vercel** (see Step 6).

---

## Step 4 — First run locally (migrations + content)

Migrations run **automatically** when the server or ingest starts (from `apps/api`).

**Terminal 1 — API**

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal\apps\api"
go run ./cmd/server
```

You should see: `StackJournal API listening on :8080`

(First start applies all SQL under `apps/api/migrations/`.)

**Terminal 2 — Ingest articles**

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal\apps\api"
go run ./cmd/ingest
```

Wait until it finishes (RSS + Hacker News). This can take a few minutes.

**Terminal 3 — Frontend**

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal\apps\web"
npm install
npm run dev
```

Open http://localhost:3000

**Check:**

- Home shows articles
- `/learning` and `/case-studies` work
- `⌘K` / search works

> Running ingest here against your Neon `DATABASE_URL` also populates production data before you deploy.

---

## Step 5 — Deploy the Go API on Render

1. [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
2. Settings:

| Field | Value |
|-------|--------|
| **Root Directory** | `apps/api` |
| **Runtime** | Go |
| **Build Command** | `go build -o bin/server ./cmd/server` |
| **Start Command** | `./bin/server` |
| **Instance** | Free |

3. **Environment variables:**

| Key | Value |
|-----|--------|
| `DATABASE_URL` | same Neon URL |
| `PORT` | `8080` (Render may override; if it sets `PORT`, leave theirs) |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGIN` | your Vercel URL later (for now `http://localhost:3000`; see Step 7) |

4. Deploy → wait for green.

**Check:** open one of these URLs:

- `https://YOUR-SERVICE.onrender.com/v1/health` → `{"status":"ok",...}`
- `https://YOUR-SERVICE.onrender.com/v1/articles/latest` → JSON article list

> Free Render sleeps after idle — first request can take ~30–60s.

---

## Step 6 — Deploy the frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import `StackJournal`.
2. Settings:

| Field | Value |
|-------|--------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (auto-detected) |

3. **Environment variables** (all three are required):

| Key | Value |
|-----|--------|
| `API_URL` | `https://YOUR-SERVICE.onrender.com/v1` |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-SERVICE.onrender.com/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` |

4. Deploy.

**Check:** open the Vercel URL — articles load (may be slow first time while Render wakes).

> Server-side rendering calls your own Vercel URL at `/api/backend`. Without `NEXT_PUBLIC_APP_URL`, pages try `localhost:3000` and fail in production.

---

## Step 7 — Fix CORS after you know the Vercel URL

In Render → **Environment**:

```env
CORS_ORIGIN=https://YOUR-PROJECT.vercel.app
```

Redeploy the API (or restart).

Most browser calls go through Vercel's `/api/backend` proxy, so CORS is less critical — but set it correctly anyway.

---

## Step 8 — Morning ingest at 6 AM Bangladesh time

### 8a. Change the schedule in the repo

Edit `.github/workflows/ingest.yml`:

```yaml
on:
  schedule:
    - cron: "0 0 * * *"   # 00:00 UTC = 06:00 Asia/Dhaka
  workflow_dispatch:
```

Commit and push:

```powershell
cd "E:\Career Track\Development\Fun Project\StackJournal"
git add .github/workflows/ingest.yml
git commit -m "Run article ingest daily at 6 AM Bangladesh time"
git push
```

### 8b. Add the GitHub secret

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|--------|
| `DATABASE_URL` | your Neon connection string |

### 8c. Test ingest manually

GitHub → **Actions → Ingest Articles → Run workflow**

**Check:** workflow succeeds; refresh the site — new/updated articles appear.

> Scheduled runs only work after the workflow file is on the **default branch** (`main`). GitHub can delay cron by a bit on free accounts; for daily morning use that's usually fine.

---

## Step 9 — Daily use

| When | What happens |
|------|--------------|
| ~6:00 AM BD | GitHub Actions runs `go run ./cmd/ingest` → updates Neon |
| You open the site | Vercel → proxies to Render API → reads Neon |
| First open after idle | Possible 10–60s wait (Render + Neon wake up) |

Bookmarks / reading progress stay in **your browser** (`localStorage`) — they don't sync across devices unless you use the same browser profile.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `backend unavailable` / 503 | Render asleep, wrong `API_URL`, or Vercel proxy timed out (8s limit) while Render wakes |
| Empty home, no articles | Ingest never ran, or wrong `DATABASE_URL` |
| Actions ingest fails | Missing `DATABASE_URL` secret, or Go setup issue |
| Migrations error | Bad Neon URL (must include `sslmode=require`) |
| Works locally, not on Vercel | Forgot env vars, Root Directory not `apps/web`, or missing `NEXT_PUBLIC_APP_URL` |
| First load shows placeholders | Render cold start — wait 30–60s and refresh |

### Render cold start

The Vercel proxy at `/api/backend` times out after **8 seconds**. If Render is asleep, the first request may fail even though Render is still waking. Refresh once after ~30–60s, or hit the Render health URL directly to wake the API first.

---

## Suggested order

Do these in sequence:

1. GitHub repo (new repo inside `StackJournal`)
2. Neon + local `.env` files
3. Local server + ingest + `npm run dev` (prove it works)
4. Render API
5. Vercel web (all three env vars)
6. CORS + env polish
7. GitHub Actions secret + daily cron + manual test run

---

## Quick reference — env vars

### Local (`apps/api/.env`)

| Key | Example |
|-----|---------|
| `PORT` | `8080` |
| `ENVIRONMENT` | `development` |
| `DATABASE_URL` | Neon connection string |
| `CORS_ORIGIN` | `http://localhost:3000` |

### Local (`apps/web/.env.local`)

| Key | Example |
|-----|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/v1` |
| `API_URL` | `http://localhost:8080/v1` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

### Render

| Key | Example |
|-----|---------|
| `DATABASE_URL` | Neon connection string |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGIN` | `https://YOUR-PROJECT.vercel.app` |

### Vercel

| Key | Example |
|-----|---------|
| `API_URL` | `https://YOUR-SERVICE.onrender.com/v1` |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-SERVICE.onrender.com/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` |

### GitHub Actions secret

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon connection string |
