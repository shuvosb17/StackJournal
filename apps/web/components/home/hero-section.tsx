import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type ContinueReadingProps = {
  title: string;
  slug: string;
  progress?: number;
  sourceName?: string;
};

export function ContinueReading({
  title,
  slug,
  progress = 0,
  sourceName,
}: ContinueReadingProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Continue reading
      </h2>

      <Link
        href={`/article/${slug}`}
        className="group surface-soft block rounded-2xl p-5 transition-all duration-500 ease-smooth hover:border-white/[0.12] hover:bg-white/[0.04]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[22px] leading-snug tracking-tight text-foreground transition-opacity duration-300 group-hover:opacity-90">
              {title}
            </h3>
            {sourceName && (
              <p className="mt-2 text-[13px] text-muted-foreground">
                {sourceName}
              </p>
            )}

            <div className="mt-5 space-y-2">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-foreground/80 transition-all duration-500 ease-smooth"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-[12px] tabular-nums text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>

          <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-90 transition-transform duration-500 ease-smooth group-hover:scale-105">
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </span>
        </div>
      </Link>
    </section>
  );
}

type HeroSectionProps = {
  greeting: string;
  newCount: number;
};

export function HeroSection({ greeting, newCount }: HeroSectionProps) {
  return (
    <section className="space-y-4 pb-4 pt-10 sm:pt-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Your reading room
      </p>
      <h1 className="font-display text-balance-pretty text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-[3.5rem]">
        {greeting}.
      </h1>
      {newCount > 0 ? (
        <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          <span className="text-foreground/90">{newCount}</span> new{" "}
          {newCount === 1 ? "article" : "articles"} ready for today — curated
          quietly, without the noise.
        </p>
      ) : (
        <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          Settle in. Your feeds, paths, and case studies are waiting.
        </p>
      )}
    </section>
  );
}
