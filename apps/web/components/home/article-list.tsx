import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import type { Article } from "@/lib/api/types";
import { formatRelativeDate } from "@/lib/utils/format";

type ArticleRowProps = {
  article: Article;
  showSource?: boolean;
};

export function ArticleRow({ article, showSource = true }: ArticleRowProps) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex items-start justify-between gap-6 py-4 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        {(showSource || article.excerpt) && (
          <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-muted-foreground">
            {showSource && article.sourceName && (
              <span>{article.sourceName}</span>
            )}
            {showSource && article.sourceName && article.excerpt && (
              <span className="mx-1.5 text-border">·</span>
            )}
            {article.excerpt}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted-foreground">
        {article.readingTimeMinutes && (
          <span className="hidden items-center gap-1 sm:flex">
            <Clock className="size-3" strokeWidth={1.75} />
            {article.readingTimeMinutes}m
          </span>
        )}
        <span className="tabular-nums">
          {formatRelativeDate(article.publishedAt)}
        </span>
        <ArrowRight
          className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}

type ArticleListProps = {
  title: string;
  articles: Article[];
  subtitle?: string;
};

export function ArticleListSection({
  title,
  articles,
  subtitle,
}: ArticleListProps) {
  if (articles.length === 0) return null;

  return (
    <section className="space-y-1">
      <div className="mb-2">
        <h2 className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            {subtitle}
          </p>
        )}
      </div>

      <div className="divide-y divide-border/40">
        {articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
