"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getBookmarkSlugs,
  isBookmarked,
  toggleBookmarkSlug,
} from "@/lib/storage/local";

export function useBookmarks(slug: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(slug));
  }, [slug]);

  const toggle = useCallback(() => {
    const next = toggleBookmarkSlug(slug);
    setBookmarked(next);
    window.dispatchEvent(new Event("stackjournal:bookmarks"));
  }, [slug]);

  return { bookmarked, toggle };
}

export function useBookmarkSlugs() {
  const [slugs, setSlugs] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setSlugs(getBookmarkSlugs());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("stackjournal:bookmarks", refresh);
    return () => window.removeEventListener("stackjournal:bookmarks", refresh);
  }, [refresh]);

  return slugs;
}
