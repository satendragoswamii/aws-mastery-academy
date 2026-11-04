import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { activityDays, learnerProfiles, lessonProgress } from "@/db/schema";
import {
  addNote,
  deleteNote,
  getProgressMap,
  InvalidLearningTarget,
  isBookmarked,
  listBookmarks,
  listNotes,
  recordSectionVisit,
  toggleBookmark,
  updateNote,
} from "@/lib/learning/progress";
import { resetDb, seedUser, testDb } from "../helpers/db";

const { db, sql } = testDb();
afterAll(() => sql.end());
beforeEach(() => resetDb(db));

const LESSON = "what-is-cloud-computing";
const tz = { timeZone: "Asia/Kolkata" };

describe("recordSectionVisit", () => {
  it("starts the lesson, sets the resume point and counts today", async () => {
    const u = await seedUser(db);
    const now = new Date("2026-11-03T20:00:00Z"); // 4 Nov in India
    await recordSectionVisit(db, u.id, LESSON, "how", { now, ...tz });

    const p = (await getProgressMap(db, u.id)).get(LESSON)!;
    expect(p).toMatchObject({ status: "in_progress", currentSection: "how" });
    expect(p.startedAt).toEqual(now);

    const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, u.id));
    expect(profile).toMatchObject({ currentLessonSlug: LESSON, currentSection: "how" });

    const days = await db.select().from(activityDays).where(eq(activityDays.userId, u.id));
    expect(days.map((d) => d.day)).toEqual(["2026-11-04"]);
  });

  it("moves the resume point forward but keeps the original start time", async () => {
    const u = await seedUser(db);
    const t1 = new Date("2026-11-04T05:00:00Z");
    await recordSectionVisit(db, u.id, LESSON, "what", { now: t1, ...tz });
    await recordSectionVisit(db, u.id, LESSON, "cli", { now: new Date("2026-11-04T06:00:00Z"), ...tz });
    const p = (await getProgressMap(db, u.id)).get(LESSON)!;
    expect(p.currentSection).toBe("cli");
    expect(p.startedAt).toEqual(t1);
  });

  it("never downgrades a mastered or needs-revision lesson by reading it", async () => {
    const u = await seedUser(db);
    await recordSectionVisit(db, u.id, LESSON, "what", tz);
    for (const status of ["mastered", "needs_revision"] as const) {
      await db.update(lessonProgress).set({ status }).where(eq(lessonProgress.userId, u.id));
      await recordSectionVisit(db, u.id, LESSON, "why", tz);
      expect((await getProgressMap(db, u.id)).get(LESSON)!.status).toBe(status);
    }
  });

  it("records one activity row per day, however many sections are read", async () => {
    const u = await seedUser(db);
    for (const s of ["what", "why", "how"]) await recordSectionVisit(db, u.id, LESSON, s, tz);
    const days = await db.select().from(activityDays).where(eq(activityDays.userId, u.id));
    expect(days).toHaveLength(1);
  });

  it("rejects unknown lessons and sections (no forged progress)", async () => {
    const u = await seedUser(db);
    await expect(recordSectionVisit(db, u.id, "not-a-lesson", "what", tz)).rejects.toThrow(InvalidLearningTarget);
    await expect(recordSectionVisit(db, u.id, LESSON, "secret", tz)).rejects.toThrow(InvalidLearningTarget);
    await expect(recordSectionVisit(db, u.id, "traditional-it-infrastructure", "what", tz)).rejects.toThrow(
      InvalidLearningTarget, // planned, not yet written
    );
    expect((await getProgressMap(db, u.id)).size).toBe(0);
  });
});

describe("notes", () => {
  it("creates, lists, edits and deletes notes", async () => {
    const u = await seedUser(db);
    const n = await addNote(db, u.id, LESSON, "  The cloud is renting, not owning.  ");
    expect(n.body).toBe("The cloud is renting, not owning.");
    await addNote(db, u.id, null, "General note");

    expect(await listNotes(db, u.id, LESSON)).toHaveLength(1);
    expect(await listNotes(db, u.id)).toHaveLength(2);

    expect((await updateNote(db, u.id, n.id, "Edited"))?.body).toBe("Edited");
    expect(await deleteNote(db, u.id, n.id)).toBe(true);
    expect(await listNotes(db, u.id, LESSON)).toHaveLength(0);
  });

  it("rejects empty notes, oversized notes and unknown lessons", async () => {
    const u = await seedUser(db);
    await expect(addNote(db, u.id, LESSON, "   ")).rejects.toThrow(/empty/);
    await expect(addNote(db, u.id, LESSON, "x".repeat(10_001))).rejects.toThrow(/longer/);
    await expect(addNote(db, u.id, "nope", "hello")).rejects.toThrow(/Unknown lesson/);
  });

  it("one user can never read, edit or delete another user's note", async () => {
    const owner = await seedUser(db, "owner");
    const other = await seedUser(db, "other");
    const n = await addNote(db, owner.id, LESSON, "private");

    expect(await listNotes(db, other.id)).toHaveLength(0);
    expect(await updateNote(db, other.id, n.id, "hacked")).toBeNull();
    expect(await deleteNote(db, other.id, n.id)).toBe(false);
    expect((await listNotes(db, owner.id))[0].body).toBe("private");
  });
});

describe("bookmarks", () => {
  it("toggles on and off", async () => {
    const u = await seedUser(db);
    expect(await toggleBookmark(db, u.id, LESSON, "cli")).toEqual({ bookmarked: true });
    expect(await isBookmarked(db, u.id, LESSON, "cli")).toBe(true);
    expect(await listBookmarks(db, u.id)).toHaveLength(1);
    expect(await toggleBookmark(db, u.id, LESSON, "cli")).toEqual({ bookmarked: false });
    expect(await isBookmarked(db, u.id, LESSON, "cli")).toBe(false);
  });

  it("rejects unknown targets", async () => {
    const u = await seedUser(db);
    await expect(toggleBookmark(db, u.id, LESSON, "nope")).rejects.toThrow(InvalidLearningTarget);
  });
});
