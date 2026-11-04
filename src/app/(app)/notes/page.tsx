import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/db";
import { getLesson } from "@/content/load";
import { SECTIONS } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/format";
import { listBookmarks, listNotes } from "@/lib/learning/progress";
import { AddNoteForm, NoteItem } from "@/components/learn/note-forms";
import { Card } from "@/components/ui";

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Notes & bookmarks</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <Card title="General note">
          <AddNoteForm slug={null} />
        </Card>
        {notes.length === 0 && <p className="text-sm text-zinc-500">No notes yet.</p>}
        {[...groups.entries()].map(([slug, items]) => (
          <Card
            key={slug || "general"}
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
                <li key={n.id} className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                  <NoteItem id={n.id} body={n.body} updatedAt={formatDateTime(n.updatedAt)} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card title="Bookmarks" className="self-start">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-zinc-500">Use &quot;Bookmark this section&quot; inside a lesson.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {bookmarks.map((b) => (
              <li key={`${b.lessonSlug}/${b.section}`}>
                <Link className="underline" href={`/learn/${b.lessonSlug}/${b.section}`}>
                  {getLesson(b.lessonSlug)?.title ?? b.lessonSlug}
                </Link>
                <span className="block text-xs text-zinc-500">{sectionTitle(b.section)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
