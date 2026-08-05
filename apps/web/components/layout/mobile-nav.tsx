"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/learning", label: "Learning" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" strokeWidth={1.75} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)]">
          <SheetHeader>
            <SheetTitle className="font-display text-left text-xl">
              StackJournal
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1 px-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-[15px] transition-colors",
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "bg-white/[0.08] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
