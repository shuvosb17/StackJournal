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
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Browse
      </h2>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={cn(
              "rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] text-muted-foreground transition-all duration-300 ease-smooth",
              "hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-foreground",
              category.isLearning && "border-white/[0.14] text-foreground/85",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
