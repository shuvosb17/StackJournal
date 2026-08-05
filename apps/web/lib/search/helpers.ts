import type { SearchResponse, SearchResultItem } from "@/lib/api/types";
import {
  PLACEHOLDER_ARTICLES,
  PLACEHOLDER_CATEGORIES,
} from "@/lib/utils/format";

export function flattenSearchResults(response: SearchResponse): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  for (const article of response.data.articles) {
    items.push({
      type: "article",
      id: article.id,
      title: article.title,
      href: `/article/${article.slug}`,
      subtitle: [article.sourceName, article.categoryName].filter(Boolean).join(" · "),
    });
  }

  for (const category of response.data.categories) {
    items.push({
      type: "category",
      id: category.id,
      title: category.name,
      href: `/categories/${category.slug}`,
    });
  }

  for (const source of response.data.sources) {
    items.push({
      type: "source",
      id: source.id,
      title: source.name,
      href: source.url,
      external: true,
    });
  }

  for (const tag of response.data.tags) {
    items.push({
      type: "tag",
      id: tag.id,
      title: tag.name,
      href: `/search?q=${encodeURIComponent(tag.name)}`,
    });
  }

  return items;
}

export function searchOffline(query: string): SearchResultItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const items: SearchResultItem[] = [];

  for (const article of PLACEHOLDER_ARTICLES) {
    if (
      article.title.toLowerCase().includes(q) ||
      article.excerpt?.toLowerCase().includes(q) ||
      article.sourceName?.toLowerCase().includes(q) ||
      article.categoryName?.toLowerCase().includes(q) ||
      article.categorySlug?.toLowerCase().includes(q)
    ) {
      items.push({
        type: "article",
        id: article.id,
        title: article.title,
        href: `/article/${article.slug}`,
        subtitle: article.sourceName,
      });
    }
  }

  for (const category of PLACEHOLDER_CATEGORIES) {
    if (
      category.name.toLowerCase().includes(q) ||
      category.slug.toLowerCase().includes(q)
    ) {
      items.push({
        type: "category",
        id: category.id,
        title: category.name,
        href: `/categories/${category.slug}`,
      });
    }
  }

  // Common source names for offline demo
  const offlineSources = [
    { id: "go-blog", name: "Go Blog", slug: "go-blog", url: "https://go.dev/blog/" },
    { id: "stripe", name: "Stripe Engineering", slug: "stripe-engineering", url: "https://stripe.com/blog/engineering" },
    { id: "cloudflare", name: "Cloudflare Blog", slug: "cloudflare", url: "https://blog.cloudflare.com/" },
  ];

  for (const source of offlineSources) {
    if (source.name.toLowerCase().includes(q) || source.slug.includes(q)) {
      items.push({
        type: "source",
        id: source.id,
        title: source.name,
        href: source.url,
        external: true,
      });
    }
  }

  return items;
}

export function groupLabel(type: SearchResultItem["type"]): string {
  switch (type) {
    case "article":
      return "Articles";
    case "category":
      return "Categories";
    case "source":
      return "Sources";
    case "tag":
      return "Tags";
  }
}
