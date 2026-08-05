import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        StackJournal is a single-user app — no login required. Bookmarks and reading
        progress are saved in your browser.
      </p>

      <div className="mt-10 space-y-6">
        <section className="rounded-xl border border-border/50 p-5">
          <h2 className="text-[15px] font-medium">Reading preferences</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Font size, theme, and line height are available inside any article via
            the settings icon or press{" "}
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[12px]">S</kbd>.
          </p>
        </section>

        <section className="rounded-xl border border-border/50 p-5">
          <h2 className="text-[15px] font-medium">Stay updated</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Run ingestion every 30 minutes via GitHub Actions, or manually:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/40 p-3 text-[12px]">
            cd apps/api{"\n"}go run ./cmd/ingest
          </pre>
        </section>

        <section className="rounded-xl border border-border/50 p-5">
          <h2 className="text-[15px] font-medium">Keyboard shortcuts</h2>
          <dl className="mt-3 space-y-2 text-[13px] text-muted-foreground">
            <div className="flex justify-between">
              <dt>Search</dt>
              <dd>
                <kbd className="rounded border px-1.5 py-0.5 font-mono">⌘K</kbd>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Bookmark article</dt>
              <dd>
                <kbd className="rounded border px-1.5 py-0.5 font-mono">B</kbd>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block text-[13px] text-muted-foreground hover:text-foreground"
      >
        ← Back home
      </Link>
    </div>
  );
}
