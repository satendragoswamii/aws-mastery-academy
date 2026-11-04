import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ChevronDown, GraduationCap, NotebookPen, Sparkles } from "lucide-react";
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
import { SECTION_ICONS } from "@/components/learn/section-icons";
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
  const Icon = SECTION_ICONS[meta.id];

  return (
    <div className="flex flex-col gap-6">
      <VisitTracker slug={slug} section={section} />

      {/* ---------- Lesson bar: title + position ---------- */}
      <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <LessonBreadcrumb slug={slug} />
            <Link href={`/learn/${slug}`} className="block truncate text-lg font-extrabold text-ink-900 hover:underline">
              {lesson.title}
            </Link>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            Section {index + 1} of {SECTIONS.length}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={((index + 1) / SECTIONS.length) * 100} label="Position in lesson" />
        </div>
      </div>

      {/* Mobile section picker */}
      <nav aria-label="Lesson sections (compact)" className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <ol className="flex gap-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={`/learn/${slug}/${s.id}`}
                aria-current={s.id === section ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                  s.id === section ? "bg-brand-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {s.letter}. {s.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* ---------- Sidebar ---------- */}
        <aside className="hidden lg:block">
          <nav aria-label="Lesson sections" className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <ol className="flex flex-col gap-0.5">
              {SECTIONS.map((s) => {
                const SIcon = SECTION_ICONS[s.id];
                const active = s.id === section;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/learn/${slug}/${s.id}`}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition ${
                        active ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "text-slate-600 hover:bg-slate-50 hover:text-ink-900"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                          active ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <SIcon aria-hidden className="h-3.5 w-3.5" />
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
        </aside>

        {/* ---------- Main ---------- */}
        <div className="flex min-w-0 flex-col gap-6">
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md shadow-brand-500/25">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Part {meta.letter}</p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">{meta.title}</h2>
                </div>
              </div>
              <Suspense fallback={<span className="h-10 w-40" />}>
                <Bookmark slug={slug} section={section} />
              </Suspense>
            </header>
            <SectionBody lesson={lesson} section={section} />
          </article>

          {/* ---------- Prev / next ---------- */}
          <nav aria-label="Section navigation" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/learn/${slug}/${prev.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                <ArrowLeft aria-hidden className="h-5 w-5 text-slate-400 group-hover:text-ink-900" />
                <span>
                  <span className="block text-xs font-semibold text-slate-400">Previous</span>
                  <span className="font-bold text-ink-800">
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
              <NextLink href={`/learn/${nextLesson.slug}`} kicker="Lesson complete! Next lesson" title={nextLesson.title} />
            ) : (
              <NextLink href="/learn" kicker="You've reached the end 🎉" title="Back to curriculum (more lessons coming)" />
            )}
          </nav>

          {/* ---------- Notes ---------- */}
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
      className="group flex items-center justify-end gap-3 rounded-2xl bg-brand-500 p-4 text-right text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-600 sm:col-start-2"
    >
      <span>
        <span className="block text-xs font-semibold text-brand-100">{kicker}</span>
        <span className="font-bold">{title}</span>
      </span>
      <ArrowRight aria-hidden className="h-5 w-5 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

const LEVEL_CHIP = {
  beginner: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  intermediate: "bg-sky-50 text-sky-700 ring-sky-200",
  advanced: "bg-violet-50 text-violet-700 ring-violet-200",
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
          <div className="grid gap-4 xl:grid-cols-2">
            {s.terms.map((t) => (
              <div key={t.term} className="overflow-hidden rounded-2xl border border-slate-200">
                <h3 className="flex items-center gap-2 bg-slate-50 px-4 py-3 font-extrabold text-ink-900">
                  <Sparkles aria-hidden className="h-4 w-4 text-brand-500" />
                  {t.term}
                </h3>
                <dl className="space-y-3 p-4 text-[15px] leading-relaxed">
                  <TermRow label="In simple words" tone="text-brand-700">{t.simple}</TermRow>
                  <TermRow label="Technically" tone="text-sky-700">{t.technical}</TermRow>
                  <TermRow label="Example" tone="text-emerald-700">
                    <Markdown inherit>{t.example}</Markdown>
                  </TermRow>
                  <TermRow label="Why it matters" tone="text-violet-700">{t.relevance}</TermRow>
                </dl>
              </div>
            ))}
          </div>
        </div>
      );
    case "interview":
      return (
        <div className="flex flex-col gap-6">
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            🎤 Say your answer out loud (or write it in your notes) <em>before</em> opening the model answer.
          </p>
          {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
            <div key={lvl}>
              <h3 className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${LEVEL_CHIP[lvl]}`}>
                {lvl}
              </h3>
              <div className="flex flex-col gap-2">
                {s.interview[lvl].map((q) => (
                  <details key={q.question} className="group rounded-2xl border border-slate-200 open:border-brand-200 open:bg-brand-50/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold text-ink-900">
                      {q.question}
                      <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-[15px] leading-relaxed text-slate-700">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Model answer</p>
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
          <div className="flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
            <GraduationCap aria-hidden className="h-5 w-5 shrink-0 text-sky-600" />
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

function TermRow({ label, tone, children }: { label: string; tone: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className={`text-xs font-bold uppercase tracking-wide ${tone}`}>{label}</dt>
      <dd className="mt-0.5 text-slate-700">{children}</dd>
    </div>
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
            <li key={n.id} className="rounded-xl bg-amber-50/70 p-4 ring-1 ring-amber-100">
              <NoteItem id={n.id} body={n.body} updatedAt={formatDateTime(n.updatedAt)} />
            </li>
          ))}
        </ul>
      )}
      <AddNoteForm slug={slug} />
    </div>
  );
}

