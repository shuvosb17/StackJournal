import Link from "next/link";
import { Suspense } from "react";

import { SearchResultsView } from "@/components/search/search-results-view";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? params.tag ?? "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      {query ? (
        <p className="mt-2 text-[15px] text-muted-foreground">
          Results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className="mt-2 text-[15px] text-muted-foreground">
          Press{" "}
          <kbd className="rounded border px-1.5 py-0.5 font-mono text-[12px]">
            ⌘K
          </kbd>{" "}
          anywhere to search instantly.
        </p>
      )}

      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Searching…</p>}>
        <SearchResultsView query={query} />
      </Suspense>

      <Link
        href="/"
        className="mt-10 inline-block text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back home
      </Link>
    </div>
  );
}
