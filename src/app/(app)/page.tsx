import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Cloud,
  Flame,
  Lock,
  Map as MapIcon,
  PlayCircle,
  StickyNote,
  Target,
  Trophy,
} from "lucide-react";
import { getDb } from "@/db";
import { CURRICULUM } from "@/content/curriculum";
import { SECTIONS } from "@/content/schema";
import { getLesson } from "@/content/load";
import { getCurrentUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { encouragementFor, greetingFor } from "@/lib/learning/greeting";
import { listBookmarks, listNotes } from "@/lib/learning/progress";
import { loadDashboard } from "@/lib/learning/server";
import { dayInZone } from "@/lib/learning/streak";
import { ButtonLink, Card, EmptyState, ProgressBar, ProgressRing } from "@/components/ui";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-label="Loading your dashboard">
      <div className="h-52 rounded-3xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

const LEVEL_LABEL: Record<string, string> = {
  absolute_beginner: "Absolute beginner",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const sectionMeta = (id: string) => SECTIONS.find((x) => x.id === id);
const sectionTitle = (id: string) => {
  const s = sectionMeta(id);
  return s ? `${s.letter}. ${s.title}` : id;
};

async function Dashboard() {
  const user = await getCurrentUser();
  await connection();
  const now = new Date();
  const tz = env().APP_TIMEZONE;
  const db = getDb();
  const [{ dashboard: d, profile }, notes, bookmarks] = await Promise.all([
    loadDashboard(user.id, now),
    listNotes(db, user.id),
    listBookmarks(db, user.id),
  ]);
  const firstName = user.displayName.split(/\s+/)[0];
  const resumeIndex = d.resume ? SECTIONS.findIndex((s) => s.id === d.resume!.section) : -1;

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-6 text-white shadow-xl shadow-ink-900/15 sm:p-8">
        <Cloud aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-48 w-48 text-white/5" />
        <Cloud aria-hidden className="pointer-events-none absolute right-40 bottom-[-3rem] h-32 w-32 text-white/5" />
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greetingFor(now, tz)}, {firstName} 👋
            </h1>
            <p className="mt-2 max-w-md text-slate-300">{encouragementFor(dayInZone(now, tz))}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                <Flame aria-hidden className="h-4 w-4 text-brand-400" />
                {d.streak.current} day streak
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                <Target aria-hidden className="h-4 w-4 text-brand-400" />
                {LEVEL_LABEL[profile?.level ?? "absolute_beginner"]} track
              </span>
            </div>
          </div>

          {/* Continue card */}
          <div className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur">
            {d.resume ? (
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={((resumeIndex + 1) / SECTIONS.length) * 100}
                  label={`Section ${resumeIndex + 1} of ${SECTIONS.length}`}
                >
                  <span className="text-lg font-extrabold leading-none">
                    {resumeIndex + 1}
                    <span className="block text-[10px] font-semibold text-slate-300">of {SECTIONS.length}</span>
                  </span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-300">Continue learning</p>
                  <p className="mt-0.5 truncate text-lg font-bold">{d.resume.title}</p>
                  <p className="text-sm text-slate-300">You stopped at {sectionTitle(d.resume.section)}</p>
                </div>
              </div>
            ) : d.recommended ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-300">Your first lesson</p>
                <p className="mt-1 text-lg font-bold">{d.recommended.title}</p>
                <p className="text-sm text-slate-300">Start here. It assumes you know nothing yet.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">No lessons are available yet.</p>
            )}
            {d.resume ? (
              <ButtonLink href={`/learn/${d.resume.slug}/${d.resume.section}`} className="mt-4 w-full">
                <PlayCircle aria-hidden className="h-4 w-4" />
                Resume where I stopped
              </ButtonLink>
            ) : (
              d.recommended && (
                <ButtonLink href={`/learn/${d.recommended.slug}`} className="mt-4 w-full">
                  <PlayCircle aria-hidden className="h-4 w-4" />
                  Start learning
                </ButtonLink>
              )
            )}
          </div>
        </div>
      </section>

      {/* ---------- Stat tiles ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Flame className="h-5 w-5" />}
          tone="orange"
          label="Learning streak"
          value={
            <>
              {d.streak.current} <span className="text-base font-semibold text-slate-500">day{d.streak.current === 1 ? "" : "s"}</span>
            </>
          }
          hint={d.streak.studiedToday ? "You've studied today 🎉" : `Longest: ${d.streak.longest}. Study today to grow it.`}
        />
        <StatTile
          icon={<BookOpen className="h-5 w-5" />}
          tone="sky"
          label="Lessons started"
          value={d.totals.started}
          hint={`${d.totals.availableLessons} available to study now`}
        />
        <StatTile
          icon={<Trophy className="h-5 w-5" />}
          tone="green"
          label="Mastered"
          value={`${d.totals.mastered} / ${d.totals.curriculumLessons}`}
          hint="Earned by passing assessments"
        />
        <StatTile
          icon={<Cloud className="h-5 w-5" />}
          tone="violet"
          label="AWS services studied"
          value={d.totals.servicesStudied}
          hint="From Level 3 lessons"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* ---------- Path ---------- */}
        <Card title="Your path ahead" icon={<MapIcon className="h-4 w-4" />} action={
          <Link href="/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            Full curriculum <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }>
          <ol className="relative">
            {d.path.map((p, i) => {
              const isNext = i === 0;
              const Icon = p.status === "mastered" ? CheckCircle2 : p.available ? (isNext ? PlayCircle : BookOpen) : Lock;
              return (
                <li key={p.slug} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < d.path.length - 1 && (
                    <span aria-hidden className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-slate-200" />
                  )}
                  <span
                    className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      isNext
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                        : p.available
                          ? "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 pt-1.5">
                    {p.available ? (
                      <Link href={`/learn/${p.slug}`} className={`font-semibold hover:underline ${isNext ? "text-ink-900" : "text-ink-800"}`}>
                        {p.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-400">{p.title}</span>
                    )}
                    <p className="text-xs text-slate-500">
                      {isNext ? "Up next" : p.available ? "Ready when you are" : "Coming soon"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* ---------- Progress by level ---------- */}
        <Card title="Overall progress" icon={<Trophy className="h-4 w-4" />}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-600">Curriculum mastered</span>
            <span className="text-sm font-bold text-ink-900">{d.totals.percentMastered}%</span>
          </div>
          <ProgressBar value={d.totals.percentMastered} label="Curriculum mastered" />
          <ul className="mt-5 space-y-4">
            {d.levels.map((lv) => {
              const level = CURRICULUM.find((l) => l.id === lv.levelId);
              return (
                <li key={lv.levelId}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-ink-800">
                      Level {level?.number}: {level?.title}
                    </span>
                    <span className="whitespace-nowrap text-xs text-slate-500">
                      {lv.mastered}/{lv.total} mastered
                    </span>
                  </div>
                  <ProgressBar value={lv.total ? (lv.mastered / lv.total) * 100 : 0} label={`Level ${level?.number} mastered`} tone="green" />
                  <p className="mt-1 text-xs text-slate-500">
                    {lv.started} started · {lv.available} written so far
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            🎯 A lesson counts as mastered only after you pass its assessment. Reading it is not enough.
            Assessments arrive in Phase 10.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Quiz performance & weak topics" icon={<Target className="h-4 w-4" />}>
          {d.totals.assessmentsTaken === 0 ? (
            <EmptyState emoji="📝" title="No assessments taken yet">
              Weak topics and revision advice will appear here, based on your real answers.
            </EmptyState>
          ) : (
            <div className="space-y-3 text-sm">
              <p>
                Average score: <strong>{d.quizAverage}%</strong>
              </p>
              {d.weakTopics.length === 0 ? (
                <p className="text-slate-500">No weak topics right now. Nice work!</p>
              ) : (
                <ul className="space-y-1">
                  {d.weakTopics.map((t) => (
                    <li key={t.topic}>
                      {t.topic}: {t.average}% over {t.attempts} attempt{t.attempts === 1 ? "" : "s"}
                    </li>
                  ))}
                </ul>
              )}
              {d.revision.length > 0 && (
                <ul className="list-disc pl-5">
                  {d.revision.map((r) => (
                    <li key={r.slug}>
                      <Link className="underline" href={`/learn/${r.slug}`}>
                        {r.title}
                      </Link>{" "}
                      <span className="text-slate-500">({r.reason})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

        <Card
          title="Bookmarks & recent notes"
          icon={<Bookmark className="h-4 w-4" />}
          action={
            <Link href="/notes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              See all <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          }
        >
          {bookmarks.length === 0 && notes.length === 0 ? (
            <EmptyState emoji="🔖" title="Nothing saved yet">
              Bookmark a section or write a note while you learn, and it will show up here.
            </EmptyState>
          ) : (
            <div className="space-y-3 text-sm">
              {bookmarks.slice(0, 4).map((b) => (
                <Link
                  key={`${b.lessonSlug}/${b.section}`}
                  href={`/learn/${b.lessonSlug}/${b.section}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-300 hover:bg-brand-50/50"
                >
                  <Bookmark aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-800">{getLesson(b.lessonSlug)?.title ?? b.lessonSlug}</span>
                    <span className="text-xs text-slate-500">{sectionTitle(b.section)}</span>
                  </span>
                </Link>
              ))}
              {notes.slice(0, 3).map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
                  <StickyNote aria-hidden className="h-4 w-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 whitespace-pre-wrap text-ink-800">{n.body}</p>
                    {n.lessonSlug && <p className="mt-1 text-xs text-slate-500">{getLesson(n.lessonSlug)?.title ?? n.lessonSlug}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const TONES = {
  orange: "bg-brand-50 text-brand-600",
  sky: "bg-sky-50 text-sky-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
} as const;

function StatTile({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,27,45,0.04)]">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone]}`}>{icon}</span>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
