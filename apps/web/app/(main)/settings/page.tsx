import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Preferences
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] tracking-tight text-foreground">
        Settings
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        StackJournal is a single-user app — no login required. Bookmarks and
        reading progress are saved in your browser.
      </p>

      <div className="mt-12 space-y-4">
        <section className="surface-soft rounded-2xl p-5">
          <h2 className="text-[15px] font-medium text-foreground">
            Reading preferences
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Font size, theme, and line height are available inside any article
            via the settings icon or press{" "}
            <kbd className="rounded-md border border-white/[0.1] px-1.5 py-0.5 font-mono text-[12px]">
              S
            </kbd>
            .
          </p>
        </section>

        <section className="surface-soft rounded-2xl p-5">
          <h2 className="text-[15px] font-medium text-foreground">
            Stay updated
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Run ingestion every morning via GitHub Actions, or manually:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-black/25 p-3 text-[12px] text-foreground/80">
            cd apps/api{"\n"}go run ./cmd/ingest
          </pre>
        </section>

        <section className="surface-soft rounded-2xl p-5">
          <h2 className="text-[15px] font-medium text-foreground">
            Keyboard shortcuts
          </h2>
          <dl className="mt-3 space-y-2.5 text-[13px] text-muted-foreground">
            <div className="flex justify-between">
              <dt>Search</dt>
              <dd>
                <kbd className="rounded-md border border-white/[0.1] px-1.5 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Bookmark article</dt>
              <dd>
                <kbd className="rounded-md border border-white/[0.1] px-1.5 py-0.5 font-mono">
                  B
                </kbd>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <Link
        href="/"
        className="mt-12 inline-block text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
      >
        ← Back home
      </Link>
    </div>
  );
}
