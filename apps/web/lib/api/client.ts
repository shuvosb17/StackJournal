import type {
  ApiListResponse,
  Article,
  ArticleListResponse,
  CaseStudy,
  CaseStudyListItem,
  Category,
  LearningPath,
} from "./types";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const isServer = typeof window === "undefined";
  const base = isServer
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/backend`
    : "/api/backend";

  const res = await fetch(`${base}${path}`, {
    ...init,
    next: isServer ? { revalidate: 60 } : undefined,
    cache: isServer ? undefined : "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetchJson<ApiListResponse<Category>>("/categories");
  return res.data;
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const res = await fetchJson<ApiListResponse<Article>>(
    `/articles/latest?limit=${limit}`,
  );
  return res.data;
}

export async function getTrendingArticles(limit = 8): Promise<Article[]> {
  const res = await fetchJson<ApiListResponse<Article>>(
    `/articles/trending?limit=${limit}`,
  );
  return res.data;
}

export async function getArticles(
  page = 1,
  limit = 20,
  category?: string,
): Promise<ArticleListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) params.set("category", category);
  return fetchJson<ArticleListResponse>(`/articles?${params}`);
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  const res = await fetchJson<{ data: Article }>(`/articles/${slug}`);
  return res.data;
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  const res = await fetchJson<ApiListResponse<LearningPath>>("/learning/paths");
  return res.data;
}

export async function getLearningPath(slug: string): Promise<LearningPath> {
  const res = await fetchJson<{ data: LearningPath }>(`/learning/paths/${slug}`);
  return res.data;
}

export async function getCaseStudies(): Promise<CaseStudyListItem[]> {
  const res = await fetchJson<ApiListResponse<CaseStudyListItem>>("/case-studies");
  return res.data;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy> {
  const res = await fetchJson<{ data: CaseStudy }>(`/case-studies/${slug}`);
  return res.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const base =
      typeof window === "undefined"
        ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/backend`
        : "/api/backend";
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
