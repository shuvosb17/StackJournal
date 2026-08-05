import { notFound } from "next/navigation";

import { ArticleListSection } from "@/components/home/article-list";
import { getArticles, getCategories } from "@/lib/api/client";
import { PLACEHOLDER_ARTICLES, PLACEHOLDER_CATEGORIES } from "@/lib/utils/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  let category = PLACEHOLDER_CATEGORIES.find((c) => c.slug === slug);
  let articles = PLACEHOLDER_ARTICLES.filter((a) => a.categorySlug === slug);
  let isLive = false;

  try {
    const [categories, result] = await Promise.all([
      getCategories(),
      getArticles(1, 30, slug),
    ]);
    category = categories.find((c) => c.slug === slug) ?? category;
    articles = result.data;
    isLive = true;
  } catch {
    // fallback
  }

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
        Category
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{category.name}</h1>
      {category.description && (
        <p className="mt-3 max-w-2xl text-[15px] text-muted-foreground">
          {category.description}
        </p>
      )}

      <div className="mt-10">
        <ArticleListSection
          title={`Articles · ${articles.length}`}
          articles={articles}
          subtitle={isLive ? undefined : "Connect API for live articles"}
        />
      </div>
    </div>
  );
}
