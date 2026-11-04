import { describe, expect, it } from "vitest";
import type { Lesson } from "@/content/schema";
import type { CatalogueEntry } from "@/lib/learning/catalogue";
import { buildDashboard, type DashboardInput } from "@/lib/learning/dashboard";

const entry = (slug: string, available = true, levelId = "level-1"): CatalogueEntry => ({
  slug,
  title: slug.toUpperCase(),
  levelId,
  moduleId: "m",
  available,
});
const lesson = (slug: string, topics: string[]) => ({ slug, topics }) as unknown as Lesson;

function input(over: Partial<DashboardInput> = {}): DashboardInput {
  return {
    catalogue: [entry("a"), entry("b"), entry("c", false), entry("s3", true, "level-3")],
    lessons: new Map([
      ["a", lesson("a", ["cloud"])],
      ["b", lesson("b", ["pricing"])],
      ["s3", lesson("s3", ["s3"])],
    ]),
    progress: new Map(),
    resume: { lessonSlug: null, section: null },
    activeDays: [],
    today: "2026-11-04",
    attempts: [],
    ...over,
  };
}

describe("buildDashboard", () => {
  it("a brand-new learner sees zero progress and the first lesson recommended", () => {
    const d = buildDashboard(input());
    expect(d.totals).toMatchObject({ curriculumLessons: 4, availableLessons: 3, started: 0, mastered: 0, percentMastered: 0 });
    expect(d.resume).toBeNull();
    expect(d.recommended?.slug).toBe("a");
    expect(d.quizAverage).toBeNull();
    expect(d.weakTopics).toEqual([]);
  });

  it("reading lessons never counts as mastery", () => {
    const d = buildDashboard(
      input({
        progress: new Map([
          ["a", { status: "in_progress", currentSection: "check" }],
          ["b", { status: "in_progress", currentSection: "what" }],
        ]),
      }),
    );
    expect(d.totals.started).toBe(2);
    expect(d.totals.mastered).toBe(0);
    expect(d.totals.percentMastered).toBe(0);
  });

  it("resumes exactly where the learner stopped and recommends it", () => {
    const d = buildDashboard(
      input({
        progress: new Map([["b", { status: "in_progress", currentSection: "cli" }]]),
        resume: { lessonSlug: "b", section: "cli" },
      }),
    );
    expect(d.resume).toEqual({ slug: "b", title: "B", section: "cli" });
    expect(d.recommended).toMatchObject({ slug: "b", reason: "You're in the middle of this lesson." });
  });

  it("after mastering the resume lesson, recommends the first unmastered available lesson", () => {
    const d = buildDashboard(
      input({
        progress: new Map([
          ["a", { status: "mastered", currentSection: "assignment" }],
          ["b", { status: "mastered", currentSection: "assignment" }],
        ]),
        resume: { lessonSlug: "b", section: "assignment" },
      }),
    );
    expect(d.recommended?.slug).toBe("s3");
    expect(d.totals.percentMastered).toBe(50);
  });

  it("ignores a resume point whose lesson no longer exists", () => {
    const d = buildDashboard(input({ resume: { lessonSlug: "deleted", section: "what" } }));
    expect(d.resume).toBeNull();
  });

  it("counts Level 3 lessons as AWS services studied", () => {
    const d = buildDashboard(input({ progress: new Map([["s3", { status: "in_progress", currentSection: "what" }]]) }));
    expect(d.totals.servicesStudied).toBe(1);
  });

  it("derives weak topics and revision advice from real assessment scores", () => {
    const d = buildDashboard(
      input({
        attempts: [
          { kind: "quiz", score: 4, maxScore: 10, topics: ["pricing"], lessonSlug: "b" },
          { kind: "quiz", score: 6, maxScore: 10, topics: ["pricing"], lessonSlug: "b" },
          { kind: "quiz", score: 9, maxScore: 10, topics: ["cloud"], lessonSlug: "a" },
        ],
      }),
    );
    expect(d.quizAverage).toBe(63);
    expect(d.weakTopics).toEqual([{ topic: "pricing", average: 50, attempts: 2 }]);
    expect(d.revision).toEqual([{ slug: "b", title: "B", reason: "Covers a weak topic" }]);
  });

  it("reports the streak", () => {
    const d = buildDashboard(input({ activeDays: ["2026-11-03", "2026-11-04"] }));
    expect(d.streak).toEqual({ current: 2, longest: 2, studiedToday: true });
  });
});
