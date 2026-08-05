"use client";

import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/reader/types";

type TableOfContentsProps = {
  items: TocItem[];
  activeId: string | null;
  onNavigate: (id: string) => void;
};

export function TableOfContents({
  items,
  activeId,
  onNavigate,
}: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block"
    >
      <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1 border-l border-border/40">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "block w-full border-l-2 py-1 text-left text-[13px] leading-snug transition-colors",
                item.level === 3 ? "pl-5" : "pl-3",
                activeId === item.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
