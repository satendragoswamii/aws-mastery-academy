import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle2, ChevronRight, Clock, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { getDb } from "@/db";
import { CURRICULUM } from "@/content/curriculum";
import { lessons } from "@/content/load";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProgressMap } from "@/lib/learning/progress";
import { ProgressBar, StatusBadge } from "@/components/ui";
import { LEVEL_STYLE, TIER_STYLE } from "@/components/learn/stage-colors";


export default function CurriculumPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink-900">Your curriculum</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Work from top to bottom. Each lesson builds on the ones before it. Lessons marked
          &quot;Coming soon&quot; are still being written and open as soon as they&apos;re ready.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-slate-100" />}>
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
    <div className="flex flex-col gap-12">
      {CURRICULUM.map((level, li) => {
        const style = LEVEL_STYLE[li % LEVEL_STYLE.length];
        const levelLessons = level.modules.flatMap((m) => m.lessons);
        const available = levelLessons.filter((l) => authored.has(l.slug)).length;
        const mastered = levelLessons.filter((l) => progress.get(l.slug)?.status === "mastered").length;
        return (
          <section key={level.id}>
            <header className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-end">
              <div>
                <p className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${style.badge}`}>Level {level.number}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-900">{level.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">{level.description}</p>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                  <span>
                    {available} of {levelLessons.length} ready
                  </span>
                  <span>{mastered} mastered</span>
                </div>
                <ProgressBar value={(mastered / levelLessons.length) * 100} label={`Level ${level.number} mastered`} fill={style.bar} />
              </div>
            </header>

            <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-2">
              {level.modules.map((m) => (
                <div key={m.id}>
                  <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${style.text}`}>
                    {m.title}
                  </h3>
                  <ol className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {m.lessons.map((entry) => {
                      const lesson = authored.get(entry.slug);
                      const status = lesson ? (progress.get(entry.slug)?.status ?? "not_started") : "planned";
                      const Icon =
                        status === "mastered"
                          ? CheckCircle2
                          : status === "needs_revision"
                            ? RotateCcw
                            : status === "planned"
                              ? Lock
                              : PlayCircle;
                      const iconStyle =
                        status === "mastered"
                          ? "text-emerald-600"
                          : status === "in_progress"
                            ? "text-brand-500"
                            : status === "planned"
                              ? "text-slate-300"
                              : "text-slate-400";
                      const body = (
                        <>
                          <span className={`shrink-0 ${iconStyle}`}>
                            <Icon aria-hidden className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-[15px] font-medium ${lesson ? "text-ink-900" : "text-slate-400"}`}>
                              {entry.title}
                            </span>
                            {lesson ? (
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Clock aria-hidden className="h-3.5 w-3.5" />~{lesson.estimatedMinutes} min
                                </span>
                                <span className={`inline-flex items-center gap-1.5 ${(TIER_STYLE[lesson.labTier] ?? TIER_STYLE.conceptual).text}`}>
                                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${(TIER_STYLE[lesson.labTier] ?? TIER_STYLE.conceptual).dot}`} />
                                  {(TIER_STYLE[lesson.labTier] ?? TIER_STYLE.conceptual).label}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Coming soon</span>
                            )}
                          </span>
                          {lesson && status !== "not_started" && <StatusBadge status={status} />}
                          {lesson && <ChevronRight aria-hidden className="h-4 w-4 text-slate-300" />}
                        </>
                      );
                      return (
                        <li key={entry.slug}>
                          {lesson ? (
                            <Link
                              href={`/learn/${entry.slug}`}
                              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                            >
                              {body}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-3" aria-disabled>
                              {body}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
