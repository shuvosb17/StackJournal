"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";

import { ArticleRow } from "@/components/home/article-list";
import { getArticleBySlug } from "@/lib/api/client";
import type { Article } from "@/lib/api/types";
import { useBookmarkSlugs } from "@/hooks/use-bookmarks";
import { PLACEHOLDER_ARTICLES } from "@/lib/utils/format";

export function BookmarksList() {
  const slugs = useBookmarkSlugs();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugs.length === 0) {
      setArticles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      slugs.map(async (slug) => {
        try {
          return await getArticleBySlug(slug);
        } catch {
          return PLACEHOLDER_ARTICLES.find((a) => a.slug === slug) ?? null;
        }
      }),
    ).then((results) => {
      setArticles(results.filter(Boolean) as Article[]);
      setLoading(false);
    });
  }, [slugs]);

  if (loading) {
    return <p className="mt-8 text-sm text-muted-foreground">Loading bookmarks…</p>;
  }

  if (articles.length === 0) {
    return (
      <div className="mt-10 surface-soft rounded-2xl px-6 py-14 text-center">
        <Bookmark className="mx-auto size-8 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          No bookmarks yet. Press{" "}
          <kbd className="rounded-md border border-white/[0.1] px-1.5 py-0.5 font-mono text-[12px]">
            B
          </kbd>{" "}
          while reading to save an article.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 divide-y divide-white/[0.05]">
      {articles.map((article) => (
        <ArticleRow key={article.id} article={article} />
      ))}
    </div>
  );
}

export function BookmarksPageShell() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Saved
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] tracking-tight">Bookmarks</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Saved locally in your browser — no account needed.
      </p>
      <BookmarksList />
      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Back home
      </Link>
    </div>
  );
}
