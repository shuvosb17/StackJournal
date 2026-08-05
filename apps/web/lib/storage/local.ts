import { BOOKMARKS_KEY, PROGRESS_KEY } from "@/lib/reader/types";

export type StoredProgress = {
  slug: string;
  progress: number;
  updatedAt: number;
};

export function getBookmarkSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function setBookmarkSlugs(slugs: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(slugs));
}

export function toggleBookmarkSlug(slug: string): boolean {
  const current = getBookmarkSlugs();
  const exists = current.includes(slug);
  const next = exists ? current.filter((s) => s !== slug) : [...current, slug];
  setBookmarkSlugs(next);
  return !exists;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarkSlugs().includes(slug);
}

export function getProgressMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveProgress(slug: string, progress: number) {
  const map = getProgressMap();
  map[slug] = Math.min(100, Math.max(0, Math.round(progress)));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function getContinueReading(): StoredProgress | null {
  const map = getProgressMap();
  const entries = Object.entries(map)
    .filter(([, p]) => p > 0 && p < 95)
    .map(([slug, progress]) => ({ slug, progress, updatedAt: 0 }));

  if (entries.length === 0) return null;
  return entries[entries.length - 1];
}
