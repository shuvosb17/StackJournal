import { NextRequest, NextResponse } from "next/server";

import type { SearchResponse } from "@/lib/api/types";
import { searchOffline } from "@/lib/search/helpers";

const BACKEND_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/v1";

function offlineResponse(query: string, limit: number): SearchResponse {
  const items = searchOffline(query).slice(0, limit);

  const articles = items
    .filter((item) => item.type === "article")
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.href.replace("/article/", ""),
      excerpt: item.subtitle,
      sourceName: item.subtitle,
    }));

  const categories = items
    .filter((item) => item.type === "category")
    .map((item) => ({
      id: item.id,
      name: item.title,
      slug: item.href.replace("/categories/", ""),
    }));

  return {
    data: {
      articles,
      categories,
      sources: [],
      tags: [],
    },
    meta: {
      query,
      total: items.length,
      offline: true,
    },
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    20,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? "8")),
  );

  if (!query) {
    return NextResponse.json({
      data: { articles: [], categories: [], sources: [], tags: [] },
      meta: { query: "", total: 0 },
    } satisfies SearchResponse);
  }

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    const res = await fetch(`${BACKEND_URL}/search?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const payload = (await res.json()) as SearchResponse;
      return NextResponse.json(payload);
    }
  } catch {
    // Backend unavailable — fall through to offline search
  }

  return NextResponse.json(offlineResponse(query, limit));
}
