"use client";

import { useCallback, useEffect, useState } from "react";

import { getProgressMap, saveProgress as persistProgress } from "@/lib/storage/local";

type ProgressMap = Record<string, number>;

function readProgress(): ProgressMap {
  return getProgressMap();
}

export function useReadingProgress(slug: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = readProgress()[slug];
    if (saved) setProgress(saved);
  }, [slug]);

  const saveProgress = useCallback(
    (value: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(value)));
      setProgress(clamped);
      persistProgress(slug, clamped);
      window.dispatchEvent(new Event("stackjournal:progress"));
    },
    [slug],
  );

  return { progress, saveProgress };
}

export function useScrollProgress(
  slug: string,
  contentRef: React.RefObject<HTMLElement | null>,
) {
  const { progress, saveProgress } = useReadingProgress(slug);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const elementTop = scrollTop + rect.top;
      const total = el.offsetHeight - window.innerHeight;

      if (total <= 0) {
        saveProgress(100);
        return;
      }

      const scrolled = scrollTop - elementTop;
      saveProgress((scrolled / total) * 100);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [contentRef, saveProgress]);

  return progress;
}
