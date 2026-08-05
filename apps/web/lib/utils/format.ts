import type { Article, Category } from "@/lib/api/types";

export const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: "1", name: "AI", slug: "ai", sortOrder: 1, isLearning: false, createdAt: "" },
  { id: "2", name: "Backend", slug: "backend", sortOrder: 2, isLearning: true, createdAt: "" },
  { id: "3", name: "System Design", slug: "system-design", sortOrder: 4, isLearning: true, createdAt: "" },
  { id: "4", name: "Distributed Systems", slug: "distributed-systems", sortOrder: 18, isLearning: true, createdAt: "" },
  { id: "5", name: "Databases", slug: "databases", sortOrder: 12, isLearning: true, createdAt: "" },
  { id: "6", name: "Go", slug: "go", sortOrder: 13, isLearning: false, createdAt: "" },
  { id: "7", name: "Kubernetes", slug: "kubernetes", sortOrder: 15, isLearning: false, createdAt: "" },
  { id: "8", name: "Security", slug: "security", sortOrder: 8, isLearning: true, createdAt: "" },
];

export const PLACEHOLDER_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Designing Idempotent APIs at Scale",
    slug: "designing-idempotent-apis",
    excerpt: "How Stripe handles exactly-once semantics in distributed payment systems.",
    sourceName: "Stripe Engineering",
    categoryName: "Backend",
    categorySlug: "backend",
    readingTimeMinutes: 12,
    publishedAt: new Date().toISOString(),
    isFeatured: true,
    status: "published",
    canonicalUrl: "https://stripe.com/blog/idempotent",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "How Cloudflare Built a Global Edge Network",
    slug: "cloudflare-edge-network",
    excerpt: "An inside look at anycast routing, caching layers, and DDoS mitigation.",
    sourceName: "Cloudflare Blog",
    categoryName: "Networking",
    categorySlug: "networking",
    readingTimeMinutes: 18,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    isFeatured: false,
    status: "published",
    canonicalUrl: "https://blog.cloudflare.com/edge",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Go 1.23: Range Over Function Types",
    slug: "go-123-range-functions",
    excerpt: "New iterator patterns and their impact on standard library design.",
    sourceName: "Go Blog",
    categoryName: "Go",
    categorySlug: "go",
    readingTimeMinutes: 8,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    isFeatured: false,
    status: "published",
    canonicalUrl: "https://go.dev/blog/range-functions",
    createdAt: new Date().toISOString(),
  },
];

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
