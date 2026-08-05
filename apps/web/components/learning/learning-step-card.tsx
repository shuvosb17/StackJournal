"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import type { LearningPathStep } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type LearningStepCardProps = {
  step: LearningPathStep;
  index: number;
};

export function LearningStepCard({ step, index }: LearningStepCardProps) {
  return (
    <li className="relative pb-10 last:pb-0">
      <span className="absolute -left-[1.15rem] top-1 flex size-4 items-center justify-center rounded-full bg-background ring-2 ring-primary/40">
        <span className="size-1.5 rounded-full bg-primary" />
      </span>

      <div className="space-y-3 rounded-2xl border border-border/50 bg-card/30 p-5">
        <div className="space-y-1">
          <p className="text-[12px] tabular-nums text-muted-foreground">
            Step {index + 1}
          </p>
          <h2 className="text-[18px] font-medium">{step.title}</h2>
          {step.description && (
            <p className="text-[14px] text-muted-foreground">{step.description}</p>
          )}
        </div>

        {step.contentHtml && (
          <div
            className={cn(
              "reader-body max-w-none border-t border-border/40 pt-4",
              "text-[15px] text-foreground/90",
            )}
            dangerouslySetInnerHTML={{ __html: step.contentHtml }}
          />
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          {step.categorySlug && (
            <Link
              href={`/categories/${step.categorySlug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[13px] text-foreground/85 transition-colors hover:bg-white/[0.04]"
            >
              <BookOpen className="size-3.5" strokeWidth={1.75} />
              Browse {step.title} articles
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          )}
          {step.articleSlug && (
            <Link
              href={`/article/${step.articleSlug}`}
              className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline"
            >
              {step.articleTitle ?? "Read recommended article"}
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
