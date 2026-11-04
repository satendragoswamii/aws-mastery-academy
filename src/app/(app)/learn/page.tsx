import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/db";
import { CURRICULUM } from "@/content/curriculum";
import { lessons } from "@/content/load";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProgressMap } from "@/lib/learning/progress";
import { Card, LabTierLabel, StatusBadge } from "@/components/ui";

export default function CurriculumPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Curriculum</h1>
        <p className="text-sm text-zinc-500">
          Work from top to bottom. Each lesson builds on the ones before it. Lessons marked
          &quot;Planned&quot; are not written yet and can&apos;t be opened.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading your progress…</p>}>
        <CurriculumWithProgress />
      </Suspense>
    </div>
  );
}

async function CurriculumWithProgress() {
  const user = await getCurrentUser();
  await connection();
  const progress = await getProgressMap(getDb(), user.id);
  const authored = lessons();

  return (
    <div className="flex flex-col gap-6">
      {CURRICULUM.map((level) => {
        const levelLessons = level.modules.flatMap((m) => m.lessons);
        const available = levelLessons.filter((l) => authored.has(l.slug)).length;
        return (
          <Card
            key={level.id}
            title={
              <span>
                Level {level.number}: {level.title}{" "}
                <span className="text-sm font-normal text-zinc-500">
                  ({available} of {levelLessons.length} lessons available)
                </span>
              </span>
            }
          >
            <p className="-mt-1 mb-4 text-sm text-zinc-500">{level.description}</p>
            <div className="flex flex-col gap-5">
              {level.modules.map((m) => (
                <div key={m.id}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">{m.title}</h3>
                  <ol className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
                    {m.lessons.map((entry) => {
                      const lesson = authored.get(entry.slug);
                      const status = lesson ? (progress.get(entry.slug)?.status ?? "not_started") : "planned";
                      return (
                        <li key={entry.slug} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <div className="min-w-0">
                            {lesson ? (
                              <Link href={`/learn/${entry.slug}`} className="font-medium hover:underline">
                                {entry.title}
                              </Link>
                            ) : (
                              <span className="text-zinc-400">{entry.title}</span>
                            )}
                            {lesson && (
                              <span className="ml-2 text-xs text-zinc-500">
                                ~{lesson.estimatedMinutes} min · <LabTierLabel tier={lesson.labTier} />
                              </span>
                            )}
                          </div>
                          <StatusBadge status={status} />
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
