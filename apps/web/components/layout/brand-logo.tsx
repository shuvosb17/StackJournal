import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex min-w-0 items-center gap-2.5 transition-opacity duration-300 ease-smooth hover:opacity-80"
    >
      <span
        className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-1 ring-white/10"
        aria-hidden
      >
        <span className="absolute inset-0 bg-[linear-gradient(145deg,#2f2c28_0%,#1c1b19_48%,#141312_100%)]" />
        <span className="relative flex w-4 flex-col gap-[3px]">
          <span className="h-[3px] w-full rounded-full bg-[#ece4d6]/95" />
          <span className="mx-auto h-[3px] w-[85%] rounded-full bg-[#ece4d6]/72" />
          <span className="mx-auto h-[3px] w-[70%] rounded-full bg-[#ece4d6]/52" />
        </span>
      </span>
      {!compact && (
        <span className="truncate font-display text-[20px] tracking-tight text-foreground sm:text-[22px]">
          StackJournal
        </span>
      )}
    </Link>
  );
}
