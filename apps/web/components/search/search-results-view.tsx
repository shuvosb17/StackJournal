"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { searchArticles } from "@/lib/api/search";
import type { SearchResults } from "@/lib/api/types";

type SearchResultsViewProps = {
  query: string;
};

export function SearchResultsView({ query }: SearchResultsViewProps) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setOffline(false);
      setError(false);
      return;
    }

    setResults(null);
    setError(false);

    searchArticles(query, 20)
      .then((res) => {
        setResults(res.data);
        setOffline(Boolean(res.meta.offline));
      })
      .catch(() => {
        setError(true);
        setResults({ articles: [], categories: [], sources: [], tags: [] });
      });
  }, [query]);

  if (!query.trim()) return null;

  if (!results && !error) {
    return <p className="mt-8 text-sm text-muted-foreground">Searching…</p>;
  }

  if (error) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Search is temporarily unavailable. Make sure{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[12px]">npm run dev</code>{" "}
        is running, then try again.
      </p>
    );
  }

  const total =
    results!.articles.length +
    results!.categories.length +
    results!.sources.length +
    results!.tags.length;

  return (
    <div className="mt-8 space-y-8">
      {offline && (
        <p className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-[13px] text-muted-foreground">
          Showing cached results — start the Go API for live search across ingested
          articles.
        </p>
      )}

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          No results for &ldquo;{query}&rdquo;. Try a different keyword.
        </p>
      ) : (
        <>
          {results!.articles.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
                Articles
              </h2>
              <ul className="divide-y divide-border/40">
                {results!.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/article/${article.slug}`}
                      className="block py-4 transition-colors hover:text-primary"
                    >
                      <p className="font-medium">{article.title}</p>
                      {article.excerpt && (
                        <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                          {article.excerpt}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results!.categories.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
                Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {results!.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="rounded-full border border-border/50 px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results!.sources.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
                Sources
              </h2>
              <ul className="space-y-2">
                {results!.sources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] text-primary hover:underline"
                    >
                      {source.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
