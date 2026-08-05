import Link from "next/link";
import { BookOpen } from "lucide-react";

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
    <section className="space-y-3">
      <h2 className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
        Continue reading
      </h2>

      <Link
        href={`/article/${slug}`}
        className="group block rounded-xl border border-border/50 bg-card/30 p-5 transition-all hover:border-border hover:bg-card/50"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-primary/10 p-2">
            <BookOpen className="size-4 text-primary" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
            {sourceName && (
              <p className="mt-1 text-[13px] text-muted-foreground">
                {sourceName}
              </p>
            )}

            <div className="mt-4 space-y-2">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-[12px] tabular-nums text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>
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
    <section className="space-y-2 pb-2 pt-6">
      <h1 className="text-[32px] font-semibold tracking-tight text-foreground sm:text-[36px]">
        {greeting}.
      </h1>
      {newCount > 0 && (
        <p className="text-[15px] text-muted-foreground">
          {newCount} new {newCount === 1 ? "article" : "articles"} today
        </p>
      )}
    </section>
  );
}
