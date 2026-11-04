import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import {
  activityDays,
  assessmentAttempts,
  bookmarks,
  learnerProfiles,
  lessonProgress,
  notes,
} from "@/db/schema";
import { getLesson } from "@/content/load";
import { isSectionId, SECTION_IDS, type SectionId } from "@/content/schema";
import { dayInZone } from "./streak";

export class InvalidLearningTarget extends Error {}

/** Only real lessons and real sections can be recorded. Never trust client input. */
export function assertValidTarget(slug: string, section: string): asserts section is SectionId {
  if (!getLesson(slug)) throw new InvalidLearningTarget(`Unknown lesson "${slug}"`);
  if (!isSectionId(section)) throw new InvalidLearningTarget(`Unknown section "${section}"`);
}

/**
 * Records that the learner opened a lesson section:
 * - lesson becomes "in_progress" if it was "not_started" (never downgrades mastered/needs_revision)
 * - the lesson's current section and the global resume point move here
 * - today counts toward the streak
 * Reading a section never marks anything as mastered.
 */
export async function recordSectionVisit(
  db: Db,
  userId: string,
  slug: string,
  section: string,
  { now = new Date(), timeZone }: { now?: Date; timeZone: string },
) {
  assertValidTarget(slug, section);
  await db.transaction(async (tx) => {
    await tx
      .insert(lessonProgress)
      .values({
        userId,
        lessonSlug: slug,
        status: "in_progress",
        currentSection: section,
        startedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonSlug],
        set: {
          currentSection: section,
          updatedAt: now,
          status: sql`CASE WHEN ${lessonProgress.status} = 'not_started' THEN 'in_progress'::lesson_status ELSE ${lessonProgress.status} END`,
          // Raw SQL params bypass Drizzle's Date mapping, so pass an ISO string and cast.
          startedAt: sql`COALESCE(${lessonProgress.startedAt}, ${now.toISOString()}::timestamptz)`,
        },
      });

    await tx
      .insert(learnerProfiles)
      .values({ userId, currentLessonSlug: slug, currentSection: section, updatedAt: now })
      .onConflictDoUpdate({
        target: learnerProfiles.userId,
        set: { currentLessonSlug: slug, currentSection: section, updatedAt: now },
      });

    await tx
      .insert(activityDays)
      .values({ userId, day: dayInZone(now, timeZone) })
      .onConflictDoNothing();
  });
}

export async function getProgressMap(db: Db, userId: string) {
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  return new Map(rows.map((r) => [r.lessonSlug, r]));
}

export async function getProfile(db: Db, userId: string) {
  const [p] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
  return p;
}

export async function getActiveDays(db: Db, userId: string): Promise<string[]> {
  const rows = await db
    .select({ day: activityDays.day })
    .from(activityDays)
    .where(eq(activityDays.userId, userId));
  return rows.map((r) => r.day);
}

export async function getAssessmentAttempts(db: Db, userId: string) {
  return db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.userId, userId))
    .orderBy(desc(assessmentAttempts.createdAt));
}

/* ----------------------------- Notes ----------------------------- */

export const MAX_NOTE_LENGTH = 10_000;

function cleanNoteBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) throw new InvalidLearningTarget("Note is empty");
  if (trimmed.length > MAX_NOTE_LENGTH) {
    throw new InvalidLearningTarget(`Note is longer than ${MAX_NOTE_LENGTH} characters`);
  }
  return trimmed;
}

export async function addNote(db: Db, userId: string, lessonSlug: string | null, body: string) {
  if (lessonSlug !== null && !getLesson(lessonSlug)) {
    throw new InvalidLearningTarget(`Unknown lesson "${lessonSlug}"`);
  }
  const [n] = await db
    .insert(notes)
    .values({ userId, lessonSlug, body: cleanNoteBody(body) })
    .returning();
  return n;
}

/** Scoped by userId, so one user can never edit another's note even with a guessed id. */
export async function updateNote(db: Db, userId: string, noteId: string, body: string) {
  const [n] = await db
    .update(notes)
    .set({ body: cleanNoteBody(body), updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();
  return n ?? null;
}

export async function deleteNote(db: Db, userId: string, noteId: string): Promise<boolean> {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({ id: notes.id });
  return deleted.length > 0;
}

export async function listNotes(db: Db, userId: string, lessonSlug?: string) {
  return db
    .select()
    .from(notes)
    .where(
      lessonSlug === undefined
        ? eq(notes.userId, userId)
        : and(eq(notes.userId, userId), eq(notes.lessonSlug, lessonSlug)),
    )
    .orderBy(desc(notes.updatedAt));
}

/* --------------------------- Bookmarks --------------------------- */

/** Adds the bookmark if absent, removes it if present. Returns the new state. */
export async function toggleBookmark(db: Db, userId: string, slug: string, section: string) {
  assertValidTarget(slug, section);
  const removed = await db
    .delete(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.lessonSlug, slug), eq(bookmarks.section, section)),
    )
    .returning();
  if (removed.length > 0) return { bookmarked: false };
  await db.insert(bookmarks).values({ userId, lessonSlug: slug, section }).onConflictDoNothing();
  return { bookmarked: true };
}

export async function listBookmarks(db: Db, userId: string) {
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(asc(bookmarks.createdAt));
}

export async function isBookmarked(db: Db, userId: string, slug: string, section: string) {
  const rows = await db
    .select({ s: bookmarks.section })
    .from(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.lessonSlug, slug), eq(bookmarks.section, section)),
    );
  return rows.length > 0;
}

export function firstSection(): SectionId {
  return SECTION_IDS[0];
}
