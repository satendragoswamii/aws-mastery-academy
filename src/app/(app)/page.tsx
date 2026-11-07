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
import { ButtonLink, Card, EmptyState, ProgressBar } from "@/components/ui";

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
      <div className="h-52 rounded-xl bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100" />
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
    <div className="flex flex-col gap-8">
      {/* ---------- Welcome + continue ---------- */}
      <section className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-[1.75rem]">
            {greetingFor(now, tz)}, {firstName}
          </h1>
          <p className="mt-1.5 max-w-md text-slate-500">{encouragementFor(dayInZone(now, tz))}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Flame aria-hidden className="h-4 w-4 text-slate-400" />
              {d.streak.current} day streak
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target aria-hidden className="h-4 w-4 text-slate-400" />
              {LEVEL_LABEL[profile?.level ?? "absolute_beginner"]} track
            </span>
          </div>
        </div>

        {/* Continue card */}
        <div className="rounded-xl border border-slate-200 p-5">
          {d.resume ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Continue learning</p>
              <p className="mt-1 truncate text-lg font-semibold text-ink-900">{d.resume.title}</p>
              <p className="text-sm text-slate-500">You stopped at {sectionTitle(d.resume.section)}</p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar
                  value={((resumeIndex + 1) / SECTIONS.length) * 100}
                  label={`Section ${resumeIndex + 1} of ${SECTIONS.length}`}
                />
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {resumeIndex + 1} of {SECTIONS.length}
                </span>
              </div>
            </div>
          ) : d.recommended ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Your first lesson</p>
              <p className="mt-1 text-lg font-semibold text-ink-900">{d.recommended.title}</p>
              <p className="text-sm text-slate-500">Start here. It assumes you know nothing yet.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No lessons are available yet.</p>
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
      </section>

      {/* ---------- Stat tiles ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Flame className="h-5 w-5" />}
          tone="orange"
          label="Learning streak"
          value={
            <>
              {d.streak.current} <span className="text-base font-normal text-slate-500">day{d.streak.current === 1 ? "" : "s"}</span>
            </>
          }
          hint={d.streak.studiedToday ? "You've studied today" : `Longest: ${d.streak.longest}. Study today to grow it.`}
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
          <Link href="/learn" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
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
                    <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-slate-200" />
                  )}
                  <span
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      isNext
                        ? "bg-brand-500 text-white"
                        : p.available
                          ? "bg-white text-slate-500 ring-1 ring-slate-200"
                          : "bg-slate-50 text-slate-300"
                    }`}
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 pt-1">
                    {p.available ? (
                      <Link href={`/learn/${p.slug}`} className={`font-medium hover:underline ${isNext ? "text-ink-900" : "text-slate-700"}`}>
                        {p.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-400">{p.title}</span>
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
            <span className="text-sm text-slate-600">Curriculum mastered</span>
            <span className="text-sm font-semibold text-ink-900">{d.totals.percentMastered}%</span>
          </div>
          <ProgressBar value={d.totals.percentMastered} label="Curriculum mastered" />
          <ul className="mt-5 space-y-4">
            {d.levels.map((lv) => {
              const level = CURRICULUM.find((l) => l.id === lv.levelId);
              return (
                <li key={lv.levelId}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-ink-800">
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
          <p className="mt-5 text-xs text-slate-500">
            A lesson counts as mastered only after you pass its assessment. Reading it is not enough.
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
            <Link href="/notes" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
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
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <Bookmark aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-800">{getLesson(b.lessonSlug)?.title ?? b.lessonSlug}</span>
                    <span className="text-xs text-slate-500">{sectionTitle(b.section)}</span>
                  </span>
                </Link>
              ))}
              {notes.slice(0, 3).map((n) => (
                <div key={n.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                  <StickyNote aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
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
  orange: "text-slate-400",
  sky: "text-slate-400",
  green: "text-slate-400",
  violet: "text-slate-400",
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
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className={`[&>svg]:h-4 [&>svg]:w-4 ${TONES[tone]}`}>{icon}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
