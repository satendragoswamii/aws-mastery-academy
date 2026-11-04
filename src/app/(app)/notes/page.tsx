import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Bookmark, BookOpen, NotebookPen, PenLine } from "lucide-react";
import { getDb } from "@/db";
import { getLesson } from "@/content/load";
import { SECTIONS } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/format";
import { listBookmarks, listNotes } from "@/lib/learning/progress";
import { AddNoteForm, NoteItem } from "@/components/learn/note-forms";
import { Card, EmptyState } from "@/components/ui";

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Notes & bookmarks</h1>
        <p className="mt-2 text-slate-600">
          Your own words are the best revision material. Write notes as you learn.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-slate-200/60" />}>
        <NotesAndBookmarks />
      </Suspense>
    </div>
  );
}

const sectionTitle = (id: string) => {
  const s = SECTIONS.find((x) => x.id === id);
  return s ? `${s.letter}. ${s.title}` : id;
};

async function NotesAndBookmarks() {
  const user = await getCurrentUser();
  await connection();
  const db = getDb();
  const [notes, bookmarks] = await Promise.all([listNotes(db, user.id), listBookmarks(db, user.id)]);

  // Group notes by lesson; general notes (no lesson) first.
  const groups = new Map<string, typeof notes>();
  for (const n of notes) {
    const key = n.lessonSlug ?? "";
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <Card title="Write a general note" icon={<PenLine className="h-4 w-4" />}>
          <AddNoteForm slug={null} />
        </Card>
        {notes.length === 0 && (
          <EmptyState emoji="🗒️" title="No notes yet">
            Notes you write inside lessons are collected here, grouped by lesson.
          </EmptyState>
        )}
        {[...groups.entries()].map(([slug, items]) => (
          <Card
            key={slug || "general"}
            icon={slug ? <BookOpen className="h-4 w-4" /> : <NotebookPen className="h-4 w-4" />}
            title={
              slug ? (
                <Link href={`/learn/${slug}`} className="hover:underline">
                  {getLesson(slug)?.title ?? slug}
                </Link>
              ) : (
                "General notes"
              )
            }
          >
            <ul className="flex flex-col gap-3">
              {items.map((n) => (
                <li key={n.id} className="rounded-xl bg-amber-50/70 p-4 ring-1 ring-amber-100">
                  <NoteItem id={n.id} body={n.body} updatedAt={formatDateTime(n.updatedAt)} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card title="Bookmarks" icon={<Bookmark className="h-4 w-4" />} className="self-start">
        {bookmarks.length === 0 ? (
          <EmptyState emoji="🔖" title="No bookmarks yet">
            Use &quot;Bookmark this section&quot; inside a lesson to save it here.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookmarks.map((b) => (
              <li key={`${b.lessonSlug}/${b.section}`}>
                <Link
                  href={`/learn/${b.lessonSlug}/${b.section}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <Bookmark aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-900">
                      {getLesson(b.lessonSlug)?.title ?? b.lessonSlug}
                    </span>
                    <span className="block text-xs text-slate-500">{sectionTitle(b.section)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
