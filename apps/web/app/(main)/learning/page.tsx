import Link from "next/link";

import { getLearningPaths } from "@/lib/api/client";

export default async function LearningPage() {
  let paths: Awaited<ReturnType<typeof getLearningPaths>> = [];
  try {
    paths = await getLearningPaths();
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Paths
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] tracking-tight">Learning</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Structured paths from HTTP fundamentals to cloud-native systems.
      </p>

      <div className="mt-12 space-y-3">
        {paths.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Run migrations and start the API to load learning paths.
          </p>
        )}
        {paths.map((path) => (
          <Link
            key={path.id}
            href={`/learning/${path.slug}`}
            className="surface-soft group block rounded-2xl p-6 transition-all duration-500 ease-smooth hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <h2 className="font-display text-[1.45rem] tracking-tight text-foreground">
              {path.title}
            </h2>
            {path.description && (
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {path.description}
              </p>
            )}
            <p className="mt-4 text-[12px] text-muted-foreground transition-colors group-hover:text-foreground/70">
              {path.steps?.length ?? 0} steps →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
