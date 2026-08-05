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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Case Studies</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
        How the best engineering teams build and scale real systems.
      </p>

      <div className="mt-10 space-y-3">
        {studies.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Run migrations to seed case studies, then start the API.
          </p>
        )}
        {studies.map((study) => (
          <Link
            key={study.id}
            href={`/case-studies/${study.slug}`}
            className="block rounded-xl border border-border/50 p-5 transition-colors hover:border-border hover:bg-muted/20"
          >
            <p className="text-[12px] uppercase tracking-widest text-muted-foreground">
              {study.company}
            </p>
            <h2 className="mt-1 text-[17px] font-medium">{study.title}</h2>
            {study.overview && (
              <p className="mt-2 line-clamp-2 text-[14px] text-muted-foreground">
                {study.overview}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
