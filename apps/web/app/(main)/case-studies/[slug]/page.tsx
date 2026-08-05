import Link from "next/link";
import { notFound } from "next/navigation";

import { CaseStudyBody } from "@/components/case-studies/case-study-body";
import { getCaseStudy } from "@/lib/api/client";

import "@/styles/case-study.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const fallbackSections = [
  { key: "overview", label: "Overview" },
  { key: "problem", label: "Problem" },
  { key: "requirements", label: "Requirements" },
  { key: "architecture", label: "Architecture" },
  { key: "dataFlow", label: "Data Flow" },
  { key: "scaling", label: "Scaling" },
  { key: "tradeoffs", label: "Tradeoffs" },
  { key: "lessons", label: "Lessons" },
] as const;

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  let study: Awaited<ReturnType<typeof getCaseStudy>> | null = null;
  try {
    study = await getCaseStudy(slug);
  } catch {
    notFound();
  }

  if (!study) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/case-studies"
        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Case studies
      </Link>

      <header className="mt-6 border-b border-border/40 pb-8">
        {study.company && (
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {study.company}
          </p>
        )}
        <h1 className="mt-2 font-display text-[2rem] tracking-tight sm:text-[2.5rem]">
          {study.title}
        </h1>
        {study.overview && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {study.overview}
          </p>
        )}
      </header>

      {study.contentHtml ? (
        <div className="mt-10">
          <CaseStudyBody html={study.contentHtml} />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {fallbackSections.map(({ key, label }) => {
            const value = study[key as keyof typeof study];
            if (!value || typeof value !== "string") return null;
            return (
              <section key={key}>
                <h2 className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
                  {label}
                </h2>
                <p className="mt-3 text-[17px] leading-[1.8] text-foreground/90">
                  {value}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
