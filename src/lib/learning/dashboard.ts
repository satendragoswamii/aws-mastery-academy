import type { Lesson } from "@/content/schema";
import type { CatalogueEntry } from "./catalogue";
import { currentStreak, longestStreak } from "./streak";

type Status = "not_started" | "in_progress" | "needs_revision" | "mastered";

export type DashboardInput = {
  catalogue: CatalogueEntry[];
  lessons: Map<string, Lesson>;
  progress: Map<string, { status: Status; currentSection: string | null }>;
  resume: { lessonSlug: string | null; section: string | null };
  activeDays: string[];
  today: string;
  attempts: { kind: string; score: number; maxScore: number; topics: string[]; lessonSlug: string | null }[];
};

export type Dashboard = ReturnType<typeof buildDashboard>;

export const WEAK_TOPIC_THRESHOLD = 70;

const pct = (score: number, max: number) => (max > 0 ? (score / max) * 100 : 0);

/**
 * Pure summary of the learner's state. Every number comes from real records:
 * nothing is estimated, and nothing counts as mastered without an assessment.
 */
export function buildDashboard(input: DashboardInput) {
  const total = input.catalogue.length;
  const available = input.catalogue.filter((e) => e.available);
  const statusOf = (slug: string): Status => input.progress.get(slug)?.status ?? "not_started";

  const mastered = input.catalogue.filter((e) => statusOf(e.slug) === "mastered").length;
  const started = input.catalogue.filter((e) => statusOf(e.slug) !== "not_started").length;
  const needsRevision = input.catalogue.filter((e) => statusOf(e.slug) === "needs_revision");

  // Service lessons are those in Level 3.
  const servicesStudied = input.catalogue.filter(
    (e) => e.levelId === "level-3" && statusOf(e.slug) !== "not_started",
  ).length;

  // Resume exactly where the learner stopped, if that lesson still exists.
  const resumeEntry =
    input.resume.lessonSlug && input.lessons.has(input.resume.lessonSlug)
      ? input.catalogue.find((e) => e.slug === input.resume.lessonSlug)
      : undefined;
  const resume = resumeEntry
    ? { slug: resumeEntry.slug, title: resumeEntry.title, section: input.resume.section ?? "what" }
    : null;

  // Recommended next: unfinished resume lesson first, then the first available unmastered lesson.
  const recommendedEntry =
    resumeEntry && statusOf(resumeEntry.slug) !== "mastered"
      ? resumeEntry
      : available.find((e) => statusOf(e.slug) !== "mastered");
  const recommended = recommendedEntry
    ? {
        slug: recommendedEntry.slug,
        title: recommendedEntry.title,
        reason:
          recommendedEntry === resumeEntry
            ? "You're in the middle of this lesson."
            : statusOf(recommendedEntry.slug) === "needs_revision"
              ? "Your last assessment showed gaps here."
              : "Next lesson in your learning path.",
      }
    : null;

  // Assessment-based numbers (populated from Phase 10 onward).
  const scored = input.attempts.filter((a) => a.maxScore > 0);
  const quizAverage =
    scored.length > 0
      ? Math.round(scored.reduce((sum, a) => sum + pct(a.score, a.maxScore), 0) / scored.length)
      : null;

  const byTopic = new Map<string, number[]>();
  for (const a of scored) {
    for (const t of a.topics) byTopic.set(t, [...(byTopic.get(t) ?? []), pct(a.score, a.maxScore)]);
  }
  const weakTopics = [...byTopic.entries()]
    .map(([topic, scores]) => ({
      topic,
      average: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
      attempts: scores.length,
    }))
    .filter((t) => t.average < WEAK_TOPIC_THRESHOLD)
    .sort((a, b) => a.average - b.average);

  const weakSet = new Set(weakTopics.map((t) => t.topic));
  const revision = [
    ...needsRevision.map((e) => ({ slug: e.slug, title: e.title, reason: "Marked for revision" })),
    ...available
      .filter((e) => statusOf(e.slug) !== "needs_revision")
      .filter((e) => input.lessons.get(e.slug)?.topics.some((t) => weakSet.has(t)))
      .map((e) => ({ slug: e.slug, title: e.title, reason: "Covers a weak topic" })),
  ];

  // "Your path": the next few curriculum entries starting from the recommended lesson.
  const startIndex = recommendedEntry
    ? input.catalogue.findIndex((e) => e.slug === recommendedEntry.slug)
    : 0;
  const path = input.catalogue.slice(Math.max(0, startIndex), Math.max(0, startIndex) + 5).map((e) => ({
    slug: e.slug,
    title: e.title,
    available: e.available,
    status: e.available ? statusOf(e.slug) : ("planned" as const),
  }));

  // Per-level breakdown for the progress card.
  const levelIds = [...new Set(input.catalogue.map((e) => e.levelId))];
  const levels = levelIds.map((levelId) => {
    const entries = input.catalogue.filter((e) => e.levelId === levelId);
    return {
      levelId,
      total: entries.length,
      available: entries.filter((e) => e.available).length,
      started: entries.filter((e) => statusOf(e.slug) !== "not_started").length,
      mastered: entries.filter((e) => statusOf(e.slug) === "mastered").length,
    };
  });

  return {
    path,
    levels,
    totals: {
      curriculumLessons: total,
      availableLessons: available.length,
      started,
      mastered,
      percentMastered: total > 0 ? Math.round((mastered / total) * 100) : 0,
      servicesStudied,
      assessmentsTaken: input.attempts.length,
    },
    streak: {
      current: currentStreak(input.activeDays, input.today),
      longest: longestStreak(input.activeDays),
      studiedToday: input.activeDays.includes(input.today),
    },
    resume,
    recommended,
    quizAverage,
    weakTopics,
    revision,
  };
}
