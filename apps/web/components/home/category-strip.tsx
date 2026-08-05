import Link from "next/link";

import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type CategoryStripProps = {
  categories: Category[];
};

export function CategoryStrip({ categories }: CategoryStripProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
        Browse
      </h2>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={cn(
              "rounded-full border border-border/50 px-3.5 py-1.5 text-[13px] text-muted-foreground transition-all",
              "hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
              category.isLearning && "border-primary/20 text-foreground/80",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
