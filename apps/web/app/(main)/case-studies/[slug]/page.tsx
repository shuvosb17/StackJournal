import Link from "next/link";
import { notFound } from "next/navigation";

import { getCaseStudy } from "@/lib/api/client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const sections = [
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
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/case-studies"
        className="text-[13px] text-muted-foreground hover:text-foreground"
      >
        ← Case studies
      </Link>

      <header className="mt-6 border-b border-border/40 pb-8">
        {study.company && (
          <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
            {study.company}
          </p>
        )}
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight sm:text-[40px]">
          {study.title}
        </h1>
      </header>

      <div className="mt-10 space-y-10">
        {sections.map(({ key, label }) => {
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
    </article>
  );
}
