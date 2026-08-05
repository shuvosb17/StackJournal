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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Browse articles by topic.
      </p>

      <section className="mt-10">
        <h2 className="mb-4 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
          Learning
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {learning.map((cat) => (
            <CategoryLink key={cat.id} name={cat.name} slug={cat.slug} learning />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
          Topics
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {browse.map((cat) => (
            <CategoryLink key={cat.id} name={cat.name} slug={cat.slug} />
          ))}
        </div>
      </section>

      <div className="mt-12 flex gap-4 text-[13px]">
        <Link href="/learning" className="text-primary hover:underline">
          Learning paths →
        </Link>
        <Link href="/case-studies" className="text-primary hover:underline">
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
        "rounded-xl border border-border/50 px-4 py-3 text-[14px] transition-colors hover:border-border hover:bg-muted/30",
        learning && "border-primary/20",
      )}
    >
      {name}
    </Link>
  );
}
