import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ChevronDown, NotebookPen } from "lucide-react";
import { getDb } from "@/db";
import { getLesson, lessons } from "@/content/load";
import { isSectionId, SECTIONS, type Lesson, type SectionId } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/format";
import { catalogue } from "@/lib/learning/catalogue";
import { isBookmarked, listNotes } from "@/lib/learning/progress";
import { Markdown } from "@/components/markdown";
import { LessonBreadcrumb } from "@/components/lesson-header";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { AddNoteForm, NoteItem } from "@/components/learn/note-forms";
import { SelfCheckItem } from "@/components/learn/self-check";
import { VisitTracker } from "@/components/learn/visit-tracker";
import { Card, ProgressBar } from "@/components/ui";

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
  const nextLesson = order.slice(order.findIndex((e) => e.slug === slug) + 1).find((e) => e.available);

  const position = `${index + 1} of ${SECTIONS.length}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] xl:gap-14">
      <VisitTracker slug={slug} section={section} />

      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="hidden lg:block">
        <div className="sticky top-22">
          <Link href={`/learn/${slug}`} className="block text-sm font-semibold leading-snug text-ink-900 hover:text-brand-600">
            {lesson.title}
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={((index + 1) / SECTIONS.length) * 100} label="Position in lesson" />
            <span className="shrink-0 text-xs tabular-nums text-slate-400">{position}</span>
          </div>
          <nav aria-label="Lesson sections" className="mt-5 border-l border-slate-200">
            <ol className="flex flex-col">
              {SECTIONS.map((s) => {
                const active = s.id === section;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/learn/${slug}/${s.id}`}
                      aria-current={active ? "page" : undefined}
                      className={`-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3.5 pr-2 text-[13.5px] leading-snug transition-colors ${
                        active
                          ? "border-brand-500 font-medium text-brand-700"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-ink-900"
                      }`}
                    >
                      <span aria-hidden className="w-3 shrink-0 font-mono text-xs leading-5 text-slate-400">
                        {s.letter}
                      </span>
                      <span className="min-w-0">
                        <span className="sr-only">{s.letter} </span>
                        {s.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex min-w-0 flex-col">
        {/* Mobile: lesson title + section picker */}
        <div className="mb-6 lg:hidden">
          <Link href={`/learn/${slug}`} className="text-sm font-medium text-slate-500 hover:text-ink-900">
            {lesson.title}
          </Link>
          <details className="group mt-2 rounded-lg border border-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span className="font-medium text-ink-900">
                {meta.letter}. {meta.title}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                {position}
                <ChevronDown aria-hidden className="h-4 w-4 transition group-open:rotate-180" />
              </span>
            </summary>
            <nav aria-label="Lesson sections (compact)" className="border-t border-slate-100 py-1">
              <ol>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/learn/${slug}/${s.id}`}
                      aria-current={s.id === section ? "page" : undefined}
                      className={`flex gap-2.5 px-3 py-2 text-sm ${
                        s.id === section ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600"
                      }`}
                    >
                      <span className="w-3 font-mono text-xs leading-5 text-slate-400">{s.letter}</span>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        </div>

        <article className="max-w-[72ch]">
          <header className="mb-8 border-b border-slate-200 pb-6">
            <LessonBreadcrumb slug={slug} />
            <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink-900">{meta.title}</h1>
              <Suspense fallback={<span className="h-9 w-36" />}>
                <Bookmark slug={slug} section={section} />
              </Suspense>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Part {meta.letter} · Section {position}
            </p>
          </header>
          <SectionBody lesson={lesson} section={section} />
        </article>

        {/* ---------- Prev / next ---------- */}
        <nav aria-label="Section navigation" className="mt-14 grid max-w-[72ch] gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/learn/${slug}/${prev.id}`}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft aria-hidden className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-ink-900" />
              <span>
                <span className="block text-xs text-slate-500">Previous</span>
                <span className="text-sm font-medium text-ink-900">
                  {prev.letter}. {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <NextLink href={`/learn/${slug}/${next.id}`} kicker="Next" title={`${next.letter}. ${next.title}`} />
          ) : nextLesson ? (
            <NextLink href={`/learn/${nextLesson.slug}`} kicker="Lesson complete. Next lesson" title={nextLesson.title} />
          ) : (
            <NextLink href="/learn" kicker="You've reached the end" title="Back to curriculum (more lessons coming)" />
          )}
        </nav>

        {/* ---------- Notes ---------- */}
        <div className="mt-10 max-w-[72ch]">
          <Card title="My notes for this lesson" icon={<NotebookPen className="h-4 w-4" />}>
            <Suspense fallback={<p className="text-sm text-slate-500">Loading notes…</p>}>
              <LessonNotes slug={slug} />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NextLink({ href, kicker, title }: { href: string; kicker: string; title: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-end gap-3 rounded-lg border border-slate-200 px-4 py-3 text-right transition-colors hover:border-brand-300 hover:bg-brand-50/50 sm:col-start-2"
    >
      <span>
        <span className="block text-xs text-slate-500">{kicker}</span>
        <span className="text-sm font-medium text-brand-700">{title}</span>
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-brand-500 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

const LEVEL_CHIP = {
  beginner: "text-slate-500",
  intermediate: "text-slate-500",
  advanced: "text-slate-500",
} as const;

function SectionBody({ lesson, section }: { lesson: Lesson; section: SectionId }) {
  const s = lesson.sections;
  switch (section) {
    case "terms":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-slate-600">
            Read the <strong className="text-ink-900">simple</strong> meaning first. Come back for the technical one
            when it starts to make sense.
          </p>
          <div className="flex flex-col gap-4">
            {s.terms.map((t) => (
              <div key={t.term} className="rounded-lg border border-slate-200">
                <h3 className="border-b border-slate-100 px-5 py-3 font-semibold text-ink-900">
                  {t.term}
                </h3>
                <dl className="grid gap-x-6 gap-y-3 px-5 py-4 text-[15px] leading-relaxed sm:grid-cols-[130px_1fr]">
                  <TermRow label="In simple words">{t.simple}</TermRow>
                  <TermRow label="Technically">{t.technical}</TermRow>
                  <TermRow label="Example">
                    <Markdown inherit>{t.example}</Markdown>
                  </TermRow>
                  <TermRow label="Why it matters">{t.relevance}</TermRow>
                </dl>
              </div>
            ))}
          </div>
        </div>
      );
    case "interview":
      return (
        <div className="flex flex-col gap-6">
          <p className="text-slate-600">
            Say your answer out loud (or write it in your notes) <em>before</em> opening the model answer.
          </p>
          {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
            <div key={lvl}>
              <h3 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${LEVEL_CHIP[lvl]}`}>
                {lvl}
              </h3>
              <div className="flex flex-col gap-2">
                {s.interview[lvl].map((q) => (
                  <details key={q.question} className="group rounded-lg border border-slate-200 open:bg-slate-50/60">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-medium text-ink-900">
                      {q.question}
                      <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-[15px] leading-relaxed text-slate-700">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Model answer</p>
                      {q.modelAnswer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "check":
      return (
        <div className="flex flex-col gap-5">
          <div className="text-slate-600">
            <p>
              Answer each question in your own words first. Use hints only if you&apos;re stuck. This self-check
              isn&apos;t graded. Graded assessments, which decide &quot;mastered&quot;, arrive in Phase 10.
            </p>
          </div>
          {s.check.map((item, i) => (
            <SelfCheckItem key={item.question} item={item} index={i} />
          ))}
        </div>
      );
    default:
      return <Markdown>{s[section]}</Markdown>;
  }
}

function TermRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-[13px] font-medium text-slate-400 sm:pt-0.5">{label}</dt>
      <dd className="text-slate-700">{children}</dd>
    </>
  );
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
            <li key={n.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <NoteItem id={n.id} body={n.body} updatedAt={formatDateTime(n.updatedAt)} />
            </li>
          ))}
        </ul>
      )}
      <AddNoteForm slug={slug} />
    </div>
  );
}

