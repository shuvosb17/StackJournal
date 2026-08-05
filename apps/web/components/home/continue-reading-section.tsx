"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ContinueReading } from "@/components/home/hero-section";
import { getArticleBySlug } from "@/lib/api/client";
import type { Article } from "@/lib/api/types";
import { getContinueReading } from "@/lib/storage/local";
import { PLACEHOLDER_ARTICLES } from "@/lib/utils/format";

export function ContinueReadingSection() {
  const [article, setArticle] = useState<Article | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      const stored = getContinueReading();
      if (!stored) return;

      setProgress(stored.progress);
      try {
        setArticle(await getArticleBySlug(stored.slug));
      } catch {
        const fallback = PLACEHOLDER_ARTICLES.find((a) => a.slug === stored.slug);
        if (fallback) setArticle(fallback);
      }
    };

    load();
    window.addEventListener("stackjournal:progress", load);
    return () => window.removeEventListener("stackjournal:progress", load);
  }, []);

  if (!article) return null;

  return (
    <ContinueReading
      title={article.title}
      slug={article.slug}
      progress={progress}
      sourceName={article.sourceName}
    />
  );
}

export function DailySetupBanner() {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-[13px] text-muted-foreground">
      <p>
        For live articles, run the API + ingest:{" "}
        <code className="rounded bg-muted px-1 py-0.5">go run ./cmd/server</code> then{" "}
        <code className="rounded bg-muted px-1 py-0.5">go run ./cmd/ingest</code>
      </p>
      <Link href="/learning" className="mt-2 inline-block text-primary hover:underline">
        Explore learning paths →
      </Link>
    </div>
  );
}
