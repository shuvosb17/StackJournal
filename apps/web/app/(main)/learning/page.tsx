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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Learning</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
        Structured paths from HTTP fundamentals to cloud-native systems.
      </p>

      <div className="mt-10 space-y-4">
        {paths.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Run migrations and start the API to load learning paths.
          </p>
        )}
        {paths.map((path) => (
          <Link
            key={path.id}
            href={`/learning/${path.slug}`}
            className="block rounded-xl border border-border/50 p-6 transition-colors hover:border-border hover:bg-muted/20"
          >
            <h2 className="text-lg font-medium">{path.title}</h2>
            {path.description && (
              <p className="mt-2 text-[14px] text-muted-foreground">
                {path.description}
              </p>
            )}
            <p className="mt-3 text-[12px] text-muted-foreground">
              {path.steps?.length ?? 0} steps
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
