"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Hash,
  Layers,
  Loader2,
  Rss,
  Search,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/components/search/search-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { searchArticles } from "@/lib/api/search";
import type { SearchResultItem } from "@/lib/api/types";
import {
  flattenSearchResults,
  groupLabel,
  searchOffline,
} from "@/lib/search/helpers";
import { cn } from "@/lib/utils";

const typeIcons = {
  article: FileText,
  category: Layers,
  source: Rss,
  tag: Hash,
};

function groupItems(items: SearchResultItem[]) {
  const groups: { label: string; items: SearchResultItem[] }[] = [];
  const order: SearchResultItem["type"][] = ["article", "category", "source", "tag"];

  for (const type of order) {
    const filtered = items.filter((item) => item.type === type);
    if (filtered.length > 0) {
      groups.push({ label: groupLabel(type), items: filtered });
    }
  }

  return groups;
}

export function SearchDialog() {
  const router = useRouter();
  const { open, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  const flatItems = useMemo(() => items, [items]);
  const groups = useMemo(() => groupItems(flatItems), [flatItems]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setItems([]);
      setSelectedIndex(0);
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchArticles(debouncedQuery)
      .then((response) => {
        if (cancelled) return;
        setItems(flattenSearchResults(response));
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, items.length]);

  const navigate = useCallback(
    (item: SearchResultItem) => {
      closeSearch();
      if (item.type === "source" && item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(item.href);
    },
    [closeSearch, router],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        navigate(flatItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatItems, selectedIndex, navigate]);

  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeSearch()}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] max-h-[min(70vh,560px)] translate-y-0 gap-0 overflow-hidden rounded-2xl border-white/[0.08] bg-popover/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Search StackJournal</DialogTitle>
        <DialogDescription className="sr-only">
          Search articles, categories, sources, and tags
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, categories, sources…"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-[min(50vh,420px)] overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
              Type to search across titles, content, tags, and sources
            </p>
          )}

          {query.trim() && !loading && flatItems.length === 0 && (
            <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <ul>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const Icon = typeIcons[item.type];

                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-smooth",
                          selectedIndex === index
                            ? "bg-white/[0.07] text-foreground"
                            : "text-foreground/90 hover:bg-white/[0.04]",
                        )}
                      >
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium">
                            {item.title}
                          </p>
                          {"subtitle" in item && item.subtitle && (
                            <p className="truncate text-[12px] text-muted-foreground">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className={cn(
                            "size-3.5 shrink-0 text-muted-foreground transition-opacity",
                            selectedIndex === index ? "opacity-100" : "opacity-0",
                          )}
                          strokeWidth={1.75}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>Navigate with ↑ ↓ · Enter to open</span>
          <kbd className="rounded border border-border/60 px-1.5 py-0.5 font-mono">
            esc
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
