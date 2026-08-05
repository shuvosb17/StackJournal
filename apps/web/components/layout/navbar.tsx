"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/categories", label: "Categories" },
  { href: "/learning", label: "Learning" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/55 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-display text-[22px] tracking-tight text-foreground transition-opacity duration-300 ease-smooth hover:opacity-75"
        >
          StackJournal
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] text-muted-foreground transition-all duration-300 ease-smooth hover:text-foreground",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "bg-white/[0.06] text-foreground"
                  : "hover:bg-white/[0.04]",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openSearch}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-muted-foreground transition-all duration-300 ease-smooth hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-foreground"
          aria-label="Open search"
        >
          <Search className="size-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded-md border border-white/[0.1] bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
