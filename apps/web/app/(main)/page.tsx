import {
  getCategories,
  getLatestArticles,
  getTrendingArticles,
} from "@/lib/api/client";
import { ArticleListSection } from "@/components/home/article-list";
import { CategoryStrip } from "@/components/home/category-strip";
import {
  ContinueReadingSection,
  DailySetupBanner,
} from "@/components/home/continue-reading-section";
import { HeroSection } from "@/components/home/hero-section";
import {
  getGreeting,
  PLACEHOLDER_ARTICLES,
  PLACEHOLDER_CATEGORIES,
} from "@/lib/utils/format";

async function loadHomeData() {
  try {
    const [categories, latest, trending] = await Promise.all([
      getCategories(),
      getLatestArticles(10),
      getTrendingArticles(8),
    ]);

    return { categories, latest, trending, isLive: true };
  } catch {
    return {
      categories: PLACEHOLDER_CATEGORIES,
      latest: PLACEHOLDER_ARTICLES,
      trending: PLACEHOLDER_ARTICLES.slice(0, 2),
      isLive: false,
    };
  }
}

export default async function HomePage() {
  const { categories, latest, trending, isLive } = await loadHomeData();
  const greeting = getGreeting();

  const todayCount = latest.filter((a) => {
    if (!a.publishedAt) return false;
    const pub = new Date(a.publishedAt);
    return pub.toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-2">
      <HeroSection greeting={greeting} newCount={isLive ? todayCount : 3} />

      <div className="mt-10 space-y-14">
        {!isLive && <DailySetupBanner />}

        <ContinueReadingSection />

        <ArticleListSection
          title="Today's new articles"
          articles={latest.slice(0, 5)}
        />

        <CategoryStrip categories={categories} />

        <ArticleListSection title="Trending today" articles={trending} />

        <ArticleListSection title="Latest" articles={latest} />
      </div>
    </div>
  );
}
