import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/db";
import { SECTIONS } from "@/content/schema";
import { getLesson } from "@/content/load";
import { getCurrentUser } from "@/lib/auth/dal";
import { listBookmarks, listNotes } from "@/lib/learning/progress";
import { loadDashboard } from "@/lib/learning/server";
import { Card, ProgressBar } from "@/components/ui";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading your dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}

const LEVEL_LABEL: Record<string, string> = {
  absolute_beginner: "Absolute beginner",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const sectionTitle = (id: string) => {
  const s = SECTIONS.find((x) => x.id === id);
  return s ? `${s.letter}. ${s.title}` : id;
};

async function Dashboard() {
  const user = await getCurrentUser();
  await connection();
  const db = getDb();
  const [{ dashboard: d, profile }, notes, bookmarks] = await Promise.all([
    loadDashboard(user.id),
    listNotes(db, user.id),
    listBookmarks(db, user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.displayName}</h1>
        <p className="text-sm text-zinc-500">
          Level: {profile ? LEVEL_LABEL[profile.level] : "Not set"}
          {profile?.certificationGoal ? ` · Goal: ${profile.certificationGoal}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Continue learning" className="md:col-span-2">
          {d.resume ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-lg font-medium">{d.resume.title}</p>
                <p className="text-sm text-zinc-500">You stopped at {sectionTitle(d.resume.section)}</p>
              </div>
              <Link
                href={`/learn/${d.resume.slug}/${d.resume.section}`}
                className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Resume where I stopped
              </Link>
            </div>
          ) : d.recommended ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-lg font-medium">{d.recommended.title}</p>
                <p className="text-sm text-zinc-500">Start here. This is the first lesson of your path.</p>
              </div>
              <Link
                href={`/learn/${d.recommended.slug}`}
                className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Start learning
              </Link>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No lessons are available yet.</p>
          )}
          {d.recommended && d.resume && d.recommended.slug !== d.resume.slug && (
            <p className="mt-4 text-sm">
              Recommended next:{" "}
              <Link className="underline" href={`/learn/${d.recommended.slug}`}>
                {d.recommended.title}
              </Link>{" "}
              <span className="text-zinc-500">({d.recommended.reason})</span>
            </p>
          )}
        </Card>

        <Card title="Learning streak">
          <p className="text-3xl font-semibold">
            {d.streak.current}{" "}
            <span className="text-base font-normal text-zinc-500">day{d.streak.current === 1 ? "" : "s"}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {d.streak.studiedToday ? "You've studied today." : "Open a lesson today to keep it going."} Longest:{" "}
            {d.streak.longest}.
          </p>
        </Card>
      </div>

      <Card title="Overall progress">
        <ProgressBar value={d.totals.percentMastered} label="Curriculum mastered" />
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
          <Stat label="Mastered" value={`${d.totals.mastered} / ${d.totals.curriculumLessons}`} />
          <Stat label="Lessons started" value={d.totals.started} />
          <Stat label="Lessons available" value={d.totals.availableLessons} />
          <Stat label="AWS services studied" value={d.totals.servicesStudied} />
          <Stat label="Assessments taken" value={d.totals.assessmentsTaken} />
        </dl>
        <p className="mt-3 text-xs text-zinc-500">
          A lesson counts as mastered only after you pass its assessment. Reading it is not enough. Assessments
          arrive in Phase 10.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Quiz performance & weak topics">
          {d.totals.assessmentsTaken === 0 ? (
            <p className="text-sm text-zinc-500">
              No assessments taken yet. Weak topics and revision advice will appear here based on your real answers.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <p>
                Average score: <strong>{d.quizAverage}%</strong>
              </p>
              {d.weakTopics.length === 0 ? (
                <p className="text-zinc-500">No weak topics right now.</p>
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
                <div>
                  <p className="font-medium">Revise:</p>
                  <ul className="list-disc pl-5">
                    {d.revision.map((r) => (
                      <li key={r.slug}>
                        <Link className="underline" href={`/learn/${r.slug}`}>
                          {r.title}
                        </Link>{" "}
                        <span className="text-zinc-500">({r.reason})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card
          title={
            <Link href="/notes" className="hover:underline">
              Bookmarks & recent notes
            </Link>
          }
        >
          {bookmarks.length === 0 && notes.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Bookmark a lesson section or write a note while you learn, and it will show up here.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {bookmarks.length > 0 && (
                <ul className="space-y-1">
                  {bookmarks.slice(0, 5).map((b) => (
                    <li key={`${b.lessonSlug}/${b.section}`}>
                      🔖{" "}
                      <Link className="underline" href={`/learn/${b.lessonSlug}/${b.section}`}>
                        {getLesson(b.lessonSlug)?.title ?? b.lessonSlug}: {sectionTitle(b.section)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {notes.length > 0 && (
                <ul className="space-y-2">
                  {notes.slice(0, 3).map((n) => (
                    <li key={n.id} className="rounded-md bg-zinc-50 p-2 dark:bg-zinc-800">
                      <p className="line-clamp-2 whitespace-pre-wrap">{n.body}</p>
                      {n.lessonSlug && (
                        <p className="mt-1 text-xs text-zinc-500">{getLesson(n.lessonSlug)?.title ?? n.lessonSlug}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}
