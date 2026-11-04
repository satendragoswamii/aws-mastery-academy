import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { getLesson, lessons } from "@/content/load";
import { isSectionId, SECTIONS, type Lesson, type SectionId } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/format";
import { catalogue } from "@/lib/learning/catalogue";
import { isBookmarked, listNotes } from "@/lib/learning/progress";
import { Markdown } from "@/components/markdown";
import { LessonHeader } from "@/components/lesson-header";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { AddNoteForm, NoteItem } from "@/components/learn/note-forms";
import { SelfCheckItem } from "@/components/learn/self-check";
import { VisitTracker } from "@/components/learn/visit-tracker";
import { Card } from "@/components/ui";

export function generateStaticParams() {
  return [...lessons().keys()].flatMap((slug) => SECTIONS.map((s) => ({ slug, section: s.id })));
}

export default async function SectionPage({ params }: PageProps<"/learn/[slug]/[section]">) {
  const { slug, section } = await params;
  const lesson = getLesson(slug);
  if (!lesson || !isSectionId(section)) notFound();

  const index = SECTIONS.findIndex((s) => s.id === section);
  const meta = SECTIONS[index];
  const prev = SECTIONS[index - 1];
  const next = SECTIONS[index + 1];
  const order = catalogue();
  const nextLesson = order
    .slice(order.findIndex((e) => e.slug === slug) + 1)
    .find((e) => e.available);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <VisitTracker slug={slug} section={section} />

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <Link href={`/learn/${slug}`} className="text-xs text-zinc-500 hover:underline">
          ← Lesson overview
        </Link>
        <nav aria-label="Lesson sections" className="mt-2">
          <ol className="space-y-0.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/learn/${slug}/${s.id}`}
                  aria-current={s.id === section ? "page" : undefined}
                  className={`block rounded px-2 py-1 ${
                    s.id === section
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="mr-2 font-mono text-xs opacity-60">{s.letter}</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <LessonHeader lesson={lesson} compact />

        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              <span className="mr-2 font-mono text-zinc-400">{meta.letter}.</span>
              {meta.title}
            </h2>
            <Suspense fallback={<span className="h-8" />}>
              <Bookmark slug={slug} section={section} />
            </Suspense>
          </div>
          <SectionBody lesson={lesson} section={section} />
        </Card>

        <nav aria-label="Section navigation" className="flex justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/learn/${slug}/${prev.id}`} className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700">
              ← {prev.letter}. {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${slug}/${next.id}`}
              className="rounded-md bg-zinc-900 px-3 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {next.letter}. {next.title} →
            </Link>
          ) : nextLesson ? (
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="rounded-md bg-zinc-900 px-3 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Next lesson: {nextLesson.title} →
            </Link>
          ) : (
            <Link href="/learn" className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700">
              Back to curriculum (more lessons coming)
            </Link>
          )}
        </nav>

        <Card title="My notes for this lesson">
          <Suspense fallback={<p className="text-sm text-zinc-500">Loading notes…</p>}>
            <LessonNotes slug={slug} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

function SectionBody({ lesson, section }: { lesson: Lesson; section: SectionId }) {
  const s = lesson.sections;
  switch (section) {
    case "terms":
      return (
        <div className="grid gap-4">
          {s.terms.map((t) => (
            <div key={t.term} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold">{t.term}</h3>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-[110px_1fr]">
                <dt className="text-zinc-500">Simple</dt>
                <dd>{t.simple}</dd>
                <dt className="text-zinc-500">Technical</dt>
                <dd>{t.technical}</dd>
                <dt className="text-zinc-500">Example</dt>
                <dd><Markdown inherit>{t.example}</Markdown></dd>
                <dt className="text-zinc-500">Why it matters</dt>
                <dd>{t.relevance}</dd>
              </dl>
            </div>
          ))}
        </div>
      );
    case "interview":
      return (
        <div className="flex flex-col gap-6">
          {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
            <div key={lvl}>
              <h3 className="mb-2 font-semibold capitalize">{lvl}</h3>
              <div className="flex flex-col gap-2">
                {s.interview[lvl].map((q) => (
                  <details key={q.question} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <summary className="cursor-pointer font-medium">{q.question}</summary>
                    <p className="mt-2 text-sm text-zinc-500">
                      Say your answer out loud before you open the model answer.
                    </p>
                    <p className="mt-2 text-sm">{q.modelAnswer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "check":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            Answer each question yourself first. Use hints only if you&apos;re stuck. This self-check isn&apos;t
            graded; graded assessments (which decide &quot;mastered&quot;) arrive in Phase 10.
          </p>
          {s.check.map((item, i) => (
            <SelfCheckItem key={item.question} item={item} index={i} />
          ))}
        </div>
      );
    default:
      return <Markdown>{s[section]}</Markdown>;
  }
}

async function Bookmark({ slug, section }: { slug: string; section: string }) {
  const user = await getCurrentUser();
  await connection();
  const initial = await isBookmarked(getDb(), user.id, slug, section);
  return <BookmarkButton slug={slug} section={section} initial={initial} />;
}


async function LessonNotes({ slug }: { slug: string }) {
  const user = await getCurrentUser();
  await connection();
  const notes = await listNotes(getDb(), user.id, slug);
  return (
    <div className="flex flex-col gap-4">
      {notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
              <NoteItem id={n.id} body={n.body} updatedAt={formatDateTime(n.updatedAt)} />
            </li>
          ))}
        </ul>
      )}
      <AddNoteForm slug={slug} />
    </div>
  );
}
