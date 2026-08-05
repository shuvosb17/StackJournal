export type Article = {
  id: string;
  sourceId?: string;
  categoryId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  author?: string;
  canonicalUrl: string;
  imageUrl?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  isFeatured: boolean;
  status: string;
  sourceName?: string;
  categoryName?: string;
  categorySlug?: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isLearning: boolean;
  createdAt: string;
};

export type ArticleListMeta = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ArticleListResponse = {
  data: Article[];
  meta: ArticleListMeta;
};

export type ApiListResponse<T> = {
  data: T[];
};

export type ApiSingleResponse<T> = {
  data: T;
};

export type SearchArticleHit = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  sourceName?: string;
  categoryName?: string;
  readingTimeMinutes?: number;
};

export type SearchCategoryHit = {
  id: string;
  name: string;
  slug: string;
};

export type SearchSourceHit = {
  id: string;
  name: string;
  slug: string;
  url: string;
};

export type SearchTagHit = {
  id: string;
  name: string;
  slug: string;
};

export type SearchResults = {
  articles: SearchArticleHit[];
  categories: SearchCategoryHit[];
  sources: SearchSourceHit[];
  tags: SearchTagHit[];
};

export type SearchResponse = {
  data: SearchResults;
  meta: { query: string; total: number; offline?: boolean };
};

export type SearchResultItem =
  | { type: "article"; id: string; title: string; href: string; subtitle?: string }
  | { type: "category"; id: string; title: string; href: string }
  | { type: "source"; id: string; title: string; href: string; external?: boolean }
  | { type: "tag"; id: string; title: string; href: string };

export type LearningPathStep = {
  id: string;
  title: string;
  description?: string;
  contentHtml?: string;
  categorySlug?: string;
  sortOrder: number;
  articleId?: string;
  articleSlug?: string;
  articleTitle?: string;
};

export type LearningPath = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder: number;
  steps: LearningPathStep[];
  createdAt: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  company?: string;
  overview?: string;
  problem?: string;
  requirements?: string;
  architecture?: string;
  dataFlow?: string;
  scaling?: string;
  tradeoffs?: string;
  lessons?: string;
  heroImage?: string;
  publishedAt?: string;
  createdAt: string;
};

export type CaseStudyListItem = {
  id: string;
  title: string;
  slug: string;
  company?: string;
  overview?: string;
  publishedAt?: string;
};
