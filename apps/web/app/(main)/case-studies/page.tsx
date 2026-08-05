import Link from "next/link";

import { getCaseStudies } from "@/lib/api/client";

export default async function CaseStudiesPage() {
  let studies: Awaited<ReturnType<typeof getCaseStudies>> = [];
  try {
    studies = await getCaseStudies();
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Engineering stories
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] tracking-tight">
        Case Studies
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        How the best engineering teams build and scale real systems.
      </p>

      <div className="mt-12 space-y-3">
        {studies.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Run migrations to seed case studies, then start the API.
          </p>
        )}
        {studies.map((study) => (
          <Link
            key={study.id}
            href={`/case-studies/${study.slug}`}
            className="surface-soft block rounded-2xl p-5 transition-all duration-500 ease-smooth hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              {study.company}
            </p>
            <h2 className="mt-1.5 font-display text-[1.35rem] tracking-tight">
              {study.title}
            </h2>
            {study.overview && (
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
                {study.overview}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
