"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { ArticleContent } from "@/components/reader/article-content";
import { ReaderProgressBar } from "@/components/reader/reader-progress-bar";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import { ReadingSettingsPanel } from "@/components/reader/reading-settings-panel";
import { TableOfContents } from "@/components/reader/table-of-contents";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReaderShortcuts } from "@/hooks/use-reader-shortcuts";
import { useScrollProgress } from "@/hooks/use-reading-progress";
import { useReadingSettings } from "@/hooks/use-reading-settings";
import type { Article } from "@/lib/api/types";
import type { TocItem } from "@/lib/reader/types";
import { isStubArticleContent } from "@/lib/reader/content";

import "highlight.js/styles/github-dark.min.css";

type ArticleReaderProps = {
  article: Article;
  contentHtml: string;
};

export function ArticleReader({ article, contentHtml }: ArticleReaderProps) {
  const { settings } = useReadingSettings();
  const { bookmarked, toggle: toggleBookmark } = useBookmarks(article.slug);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLElement>(null);

  const progress = useScrollProgress(article.slug, contentRef);
  const isStubContent = isStubArticleContent(contentHtml);

  useReaderShortcuts({
    onToggleSettings: () => setSettingsOpen((v) => !v),
    onToggleBookmark: toggleBookmark,
  });

  const handleTocChange = useCallback((items: TocItem[]) => {
    setToc(items);
  }, []);

  const handleNavigate = useCallback(
    (id: string) => {
      const root = contentRef.current;
      if (!root) return;

      const el = root.querySelector<HTMLElement>(
        `h2#${CSS.escape(id)}, h3#${CSS.escape(id)}`,
      );
      if (!el) return;

      const headerOffset = 72;
      const top =
        window.scrollY + el.getBoundingClientRect().top - headerOffset;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isTouch =
        window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion || isTouch ? "auto" : "smooth",
      });
      setActiveId(id);
    },
    [contentRef],
  );

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    const root = contentRef.current;
    if (!root) return;

    toc.forEach(({ id }) => {
      const el = root.querySelector(`h2#${CSS.escape(id)}, h3#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  return (
    <div
      className="reader-surface"
      data-theme={settings.theme}
      data-font-size={settings.fontSize}
      data-line-height={settings.lineHeight}
      data-width={settings.width}
    >
      <ReaderProgressBar progress={progress} />

      <ReaderToolbar
        title={article.title}
        canonicalUrl={article.canonicalUrl}
        bookmarked={bookmarked}
        onToggleBookmark={toggleBookmark}
        onOpenSettings={() => setSettingsOpen(true)}
        progress={progress}
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-3 py-6 sm:gap-10 sm:px-6 sm:py-10 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-16">
        <aside className="hidden xl:block">
          <div className="sticky top-20">
            <TableOfContents
              items={toc}
              activeId={activeId}
              onNavigate={handleNavigate}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <header className="reader-body mx-auto mb-10 max-w-[var(--reader-width)] space-y-4 border-b border-[var(--reader-border)] pb-8">
            <div className="flex flex-wrap items-center gap-2 font-sans text-[13px] text-[var(--reader-muted)]">
              {article.sourceName && <span>{article.sourceName}</span>}
              {article.categoryName && (
                <>
                  <span>·</span>
                  <span>{article.categoryName}</span>
                </>
              )}
              {article.readingTimeMinutes && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" strokeWidth={1.75} />
                    {article.readingTimeMinutes} min read
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display text-[clamp(1.55rem,5vw,2.75rem)] font-normal leading-[1.2] tracking-tight sm:leading-[1.15]">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="font-sans text-[15px] leading-relaxed text-[var(--reader-muted)] sm:text-[17px]">
                {article.excerpt}
              </p>
            )}
          </header>

          <div className="mx-auto max-w-[var(--reader-width)] pb-16 sm:pb-24">
            {isStubContent && article.canonicalUrl && (
              <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 font-sans text-[14px] leading-relaxed text-[var(--reader-fg)]">
                Full article text could not be loaded inline.{" "}
                <a
                  href={article.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2"
                >
                  Read the original article
                </a>{" "}
                or run ingest again to retry fetching content.
              </div>
            )}
            <ArticleContent
              html={contentHtml}
              onTocChange={handleTocChange}
              contentRef={contentRef}
            />
          </div>
        </div>
      </div>

      <ReadingSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
