import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { LearningStepCard } from "@/components/learning/learning-step-card";
import { getLearningPath } from "@/lib/api/client";

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
          <LearningStepCard key={step.id} step={step} index={index} />
        ))}
      </ol>
    </div>
  );
}
