import type { SearchResponse } from "./types";

/** Same-origin proxy — works even when the Go API is not running. */
export async function searchArticles(
  query: string,
  limit = 8,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`/api/search?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Search request failed");
  }

  return res.json() as Promise<SearchResponse>;
}
