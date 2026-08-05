"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  Settings,
} from "lucide-react";

import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/categories", label: "Categories", icon: Layers },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/case-studies", label: "Case Studies", icon: BookOpen },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            StackJournal
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
                  pathname === href && "text-foreground",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={openSearch}
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          aria-label="Open search"
        >
          <Search className="size-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-border/60 bg-background/50 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
