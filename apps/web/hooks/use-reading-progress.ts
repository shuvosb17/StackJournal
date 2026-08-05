"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(
    (value: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(value)));

      setProgress((prev) =>
        Math.abs(prev - clamped) >= 1 ? clamped : prev,
      );

      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        persistProgress(slug, clamped);
        window.dispatchEvent(new Event("stackjournal:progress"));
      }, 400);
    },
    [slug],
  );

  useEffect(
    () => () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    },
    [],
  );

  return { progress, saveProgress };
}

export function useScrollProgress(
  slug: string,
  contentRef: React.RefObject<HTMLElement | null>,
) {
  const { progress, saveProgress } = useReadingProgress(slug);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;

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
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [contentRef, saveProgress]);

  return progress;
}
