import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleReader } from "@/components/reader/article-reader";
import { getArticleBySlug } from "@/lib/api/client";
import { getDemoContent } from "@/lib/reader/demo-content";
import { PLACEHOLDER_ARTICLES } from "@/lib/utils/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadArticle(slug: string) {
  try {
    const article = await getArticleBySlug(slug);
    return { article, contentHtml: article.contentHtml ?? "" };
  } catch {
    const placeholder = PLACEHOLDER_ARTICLES.find((a) => a.slug === slug);
    if (!placeholder) return null;

    const demo = getDemoContent(slug);
    return {
      article: placeholder,
      contentHtml: demo ?? "<p>Article content unavailable.</p>",
    };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadArticle(slug);
  if (!result) return { title: "Article not found" };

  return {
    title: result.article.title,
    description: result.article.excerpt,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await loadArticle(slug);

  if (!result) notFound();

  const { article, contentHtml } = result;

  if (!contentHtml) {
    notFound();
  }

  return <ArticleReader article={article} contentHtml={contentHtml} />;
}
