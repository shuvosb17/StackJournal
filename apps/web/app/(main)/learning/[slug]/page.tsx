import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

import { getLearningPath } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LearningPathPage({ params }: PageProps) {
  const { slug } = await params;

  let path: Awaited<ReturnType<typeof getLearningPath>> | null = null;
  try {
    path = await getLearningPath(slug);
  } catch {
    notFound();
  }

  if (!path) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/learning"
        className="text-[13px] text-muted-foreground hover:text-foreground"
      >
        ← All paths
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{path.title}</h1>
      {path.description && (
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
          {path.description}
        </p>
      )}

      <ol className="relative mt-12 space-y-0 border-l border-border/50 pl-8">
        {path.steps.map((step, index) => (
          <li key={step.id} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[1.15rem] top-0.5 rounded-full bg-background">
              <Circle className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </span>

            <div className="space-y-1">
              <p className="text-[12px] tabular-nums text-muted-foreground">
                Step {index + 1}
              </p>
              <h2 className="text-[17px] font-medium">{step.title}</h2>
              {step.description && (
                <p className="text-[14px] text-muted-foreground">{step.description}</p>
              )}
              {step.articleSlug && (
                <Link
                  href={`/article/${step.articleSlug}`}
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline",
                  )}
                >
                  <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
                  {step.articleTitle ?? "Read article"}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
