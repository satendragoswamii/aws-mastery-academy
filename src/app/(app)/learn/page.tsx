import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle2, ChevronRight, Clock, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { getDb } from "@/db";
import { CURRICULUM } from "@/content/curriculum";
import { lessons } from "@/content/load";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProgressMap } from "@/lib/learning/progress";
import { LabTierLabel, ProgressBar, StatusBadge } from "@/components/ui";

export default function CurriculumPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Your curriculum</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Work from top to bottom. Each lesson builds on the ones before it. Lessons with a 🔒 are
          still being written and open as soon as they&apos;re ready.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />}>
        <CurriculumWithProgress />
      </Suspense>
    </div>
  );
}

const LEVEL_STYLE = [
  { band: "from-brand-500 to-brand-600", soft: "bg-brand-50 text-brand-700" },
  { band: "from-sky-500 to-sky-600", soft: "bg-sky-50 text-sky-700" },
  { band: "from-violet-500 to-violet-600", soft: "bg-violet-50 text-violet-700" },
];

async function CurriculumWithProgress() {
  const user = await getCurrentUser();
  await connection();
  const progress = await getProgressMap(getDb(), user.id);
  const authored = lessons();

  return (
    <div className="flex flex-col gap-8">
      {CURRICULUM.map((level, li) => {
        const style = LEVEL_STYLE[li % LEVEL_STYLE.length];
        const levelLessons = level.modules.flatMap((m) => m.lessons);
        const available = levelLessons.filter((l) => authored.has(l.slug)).length;
        const mastered = levelLessons.filter((l) => progress.get(l.slug)?.status === "mastered").length;
        return (
          <section key={level.id} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <header className={`bg-gradient-to-r ${style.band} px-6 py-5 text-white`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">Level {level.number}</p>
              <h2 className="text-xl font-extrabold">{level.title}</h2>
              <p className="mt-1 text-sm text-white/85">{level.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/90">
                <span>{levelLessons.length} lessons</span>
                <span>{available} ready to study</span>
                <span>{mastered} mastered</span>
              </div>
              <div className="mt-2 max-w-sm [&>div]:bg-white/25">
                <ProgressBar value={(mastered / levelLessons.length) * 100} label={`Level ${level.number} mastered`} tone="green" />
              </div>
            </header>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {level.modules.map((m) => (
                <div key={m.id}>
                  <h3 className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.soft}`}>
                    {m.title}
                  </h3>
                  <ol className="flex flex-col gap-2">
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
                          ? "bg-emerald-50 text-emerald-600"
                          : status === "in_progress"
                            ? "bg-sky-50 text-sky-600"
                            : status === "planned"
                              ? "bg-slate-100 text-slate-400"
                              : "bg-brand-50 text-brand-600";
                      const body = (
                        <>
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${iconStyle}`}>
                            <Icon aria-hidden className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block font-semibold ${lesson ? "text-ink-900" : "text-slate-400"}`}>
                              {entry.title}
                            </span>
                            {lesson ? (
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Clock aria-hidden className="h-3.5 w-3.5" />~{lesson.estimatedMinutes} min
                                </span>
                                <LabTierLabel tier={lesson.labTier} />
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Coming soon</span>
                            )}
                          </span>
                          {lesson && <StatusBadge status={status} />}
                          {lesson && <ChevronRight aria-hidden className="h-4 w-4 text-slate-300" />}
                        </>
                      );
                      return (
                        <li key={entry.slug}>
                          {lesson ? (
                            <Link
                              href={`/learn/${entry.slug}`}
                              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm"
                            >
                              {body}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-3" aria-disabled>
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
