"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Search,
  Settings2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

type ReaderToolbarProps = {
  title: string;
  canonicalUrl?: string;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
  progress: number;
};

export function ReaderToolbar({
  title,
  canonicalUrl,
  bookmarked,
  onToggleBookmark,
  onOpenSettings,
  progress,
}: ReaderToolbarProps) {
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground/90">
            {title}
          </p>
          <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-150"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={openSearch}
            aria-label="Search"
          >
            <Search className="size-4" strokeWidth={1.75} />
          </Button>

          {canonicalUrl && (
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open original article"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <ExternalLink className="size-4" strokeWidth={1.75} />
            </a>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
          >
            <Bookmark
              className={cn("size-4", bookmarked && "fill-primary text-primary")}
              strokeWidth={1.75}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onOpenSettings}
            aria-label="Reading settings"
          >
            <Settings2 className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </header>
  );
}
