"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import {
  addNote,
  deleteNote,
  InvalidLearningTarget,
  MAX_NOTE_LENGTH,
  recordSectionVisit,
  toggleBookmark,
  updateNote,
} from "@/lib/learning/progress";

/*
 * Every action re-authenticates through the DAL and validates its input:
 * a Server Action is a public HTTP endpoint, whatever the UI looks like.
 */

const slug = z.string().min(1).max(100);
const section = z.string().min(1).max(40);

/** Called by the lesson page after it has actually rendered in the browser. */
export async function visitSection(lessonSlug: string, sectionId: string): Promise<void> {
  const user = await getCurrentUser();
  const parsed = z.object({ slug, section }).safeParse({ slug: lessonSlug, section: sectionId });
  if (!parsed.success) return;
  try {
    await recordSectionVisit(getDb(), user.id, parsed.data.slug, parsed.data.section, {
      timeZone: env().APP_TIMEZONE,
    });
  } catch (e) {
    if (e instanceof InvalidLearningTarget) return; // ignore forged targets
    throw e;
  }
}

export type BookmarkState = { bookmarked: boolean };

export async function toggleBookmarkAction(
  prev: BookmarkState,
  formData: FormData,
): Promise<BookmarkState> {
  const user = await getCurrentUser();
  const parsed = z
    .object({ slug, section })
    .safeParse({ slug: formData.get("slug"), section: formData.get("section") });
  if (!parsed.success) return prev;
  try {
    const result = await toggleBookmark(getDb(), user.id, parsed.data.slug, parsed.data.section);
    refresh();
    return result;
  } catch (e) {
    if (e instanceof InvalidLearningTarget) return prev;
    throw e;
  }
}

/** On failure, `body` echoes the submitted text so the form can restore it. */
export type NoteFormState = { error: string | null; savedAt: number | null; body: string | null };

const noteBody = z.string().max(MAX_NOTE_LENGTH, `Notes can be at most ${MAX_NOTE_LENGTH} characters.`);

const rejected = (error: string, raw: FormDataEntryValue | null): NoteFormState => ({
  error,
  savedAt: null,
  body: typeof raw === "string" ? raw.slice(0, MAX_NOTE_LENGTH * 5) : null,
});

export async function addNoteAction(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const user = await getCurrentUser();
  const rawSlug = formData.get("slug");
  const rawBody = formData.get("body");
  const parsed = z
    .object({ slug: slug.nullable(), body: noteBody })
    .safeParse({ slug: rawSlug ? String(rawSlug) : null, body: rawBody ?? "" });
  if (!parsed.success) return rejected(parsed.error.issues[0].message, rawBody);
  try {
    await addNote(getDb(), user.id, parsed.data.slug, parsed.data.body);
  } catch (e) {
    if (e instanceof InvalidLearningTarget) return rejected(e.message, rawBody);
    throw e;
  }
  refresh();
  return { error: null, savedAt: Date.now(), body: null };
}

export async function updateNoteAction(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const user = await getCurrentUser();
  const rawBody = formData.get("body");
  const parsed = z
    .object({ id: z.uuid(), body: noteBody })
    .safeParse({ id: formData.get("id"), body: rawBody ?? "" });
  if (!parsed.success) return rejected(parsed.error.issues[0].message, rawBody);
  try {
    const updated = await updateNote(getDb(), user.id, parsed.data.id, parsed.data.body);
    if (!updated) return rejected("Note not found.", rawBody);
  } catch (e) {
    if (e instanceof InvalidLearningTarget) return rejected(e.message, rawBody);
    throw e;
  }
  refresh();
  return { error: null, savedAt: Date.now(), body: null };
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) return;
  await deleteNote(getDb(), user.id, parsed.data);
  refresh();
}
