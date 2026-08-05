import Link from "next/link";

import { getCategories } from "@/lib/api/client";
import { PLACEHOLDER_CATEGORIES } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default async function CategoriesPage() {
  let categories = PLACEHOLDER_CATEGORIES;
  try {
    categories = await getCategories();
  } catch {
    // offline fallback
  }

  const learning = categories.filter((c) => c.isLearning);
  const browse = categories.filter((c) => !c.isLearning);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Topics
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] tracking-tight">
        Categories
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Browse articles by topic.
      </p>

      <section className="mt-12">
        <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Learning
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {learning.map((cat) => (
            <CategoryLink key={cat.id} name={cat.name} slug={cat.slug} learning />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Browse
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {browse.map((cat) => (
            <CategoryLink key={cat.id} name={cat.name} slug={cat.slug} />
          ))}
        </div>
      </section>

      <div className="mt-14 flex gap-6 text-[13px] text-muted-foreground">
        <Link
          href="/learning"
          className="transition-colors duration-300 hover:text-foreground"
        >
          Learning paths →
        </Link>
        <Link
          href="/case-studies"
          className="transition-colors duration-300 hover:text-foreground"
        >
          Case studies →
        </Link>
      </div>
    </div>
  );
}

function CategoryLink({
  name,
  slug,
  learning,
}: {
  name: string;
  slug: string;
  learning?: boolean;
}) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-[14px] transition-all duration-300 ease-smooth hover:border-white/[0.14] hover:bg-white/[0.06]",
        learning && "border-white/[0.12]",
      )}
    >
      {name}
    </Link>
  );
}
