# StackJournal

Your personal engineering reading room — curated RSS feeds, Hacker News, learning paths, and case studies. **No login required.**

## Daily use

```bash
# 1. Frontend
cd apps/web && npm install && npm run dev

# 2. API + database (Neon Postgres)
cd apps/api
cp .env.example .env   # set DATABASE_URL
go run ./cmd/server

# 3. Fetch latest articles (RSS + Hacker News)
go run ./cmd/ingest
```

Open **http://localhost:3000**

- **Bookmarks & reading progress** → saved in your browser (localStorage)
- **Search** → `⌘K` anywhere
- **Learning paths** → `/learning`
- **Case studies** → `/case-studies`
- **Categories** → `/categories`

## Ingestion

Runs every 30 min via GitHub Actions, or manually:

```bash
go run ./cmd/ingest              # all RSS feeds + Hacker News
go run ./cmd/ingest -source=go-blog   # single source
```

Sources: Go Blog, AWS, Cloudflare, Stripe, Netflix, Kubernetes, HN (engineering-filtered), and more.

## API (via Next.js proxy at `/api/backend`)

| Endpoint | Description |
|----------|-------------|
| `GET /v1/articles/latest` | Latest articles |
| `GET /v1/articles?category=go` | Filter by category |
| `GET /v1/search?q=` | Full-text search |
| `GET /v1/learning/paths` | Learning paths |
| `GET /v1/case-studies` | Case studies |

## What's included

- [x] Premium reader (TOC, themes, code highlight, progress)
- [x] RSS + Hacker News ingestion
- [x] Instant search (⌘K)
- [x] Categories & category pages
- [x] Learning paths (Backend Roadmap)
- [x] Case studies (Uber, Netflix, Stripe, etc.)
- [x] Bookmarks (localStorage)
- [x] Continue reading (localStorage)
- [x] No authentication — personal single-user app

## Deploy

- **Frontend** → Vercel (`apps/web`)
- **API** → Fly.io / Railway / Render (`apps/api`)
- **Database** → Neon Postgres
- **Ingest** → GitHub Actions cron + `DATABASE_URL` secret
