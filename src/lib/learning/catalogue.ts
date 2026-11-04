import { CURRICULUM, CURRICULUM_ORDER, type CurriculumEntry } from "@/content/curriculum";
import { getLesson, lessons } from "@/content/load";
import type { Lesson } from "@/content/schema";

export type CatalogueEntry = CurriculumEntry & {
  levelId: string;
  moduleId: string;
  available: boolean;
};

/** Curriculum order with each entry marked available (content exists) or planned. */
export function catalogue(): CatalogueEntry[] {
  const authored = lessons();
  return CURRICULUM_ORDER.map((e) => ({ ...e, available: authored.has(e.slug) }));
}

export function availableLessons(): Lesson[] {
  return catalogue()
    .filter((e) => e.available)
    .map((e) => getLesson(e.slug)!);
}

export function curriculumEntry(slug: string): CatalogueEntry | undefined {
  return catalogue().find((e) => e.slug === slug);
}

export function moduleAndLevelFor(slug: string) {
  for (const level of CURRICULUM) {
    for (const m of level.modules) {
      if (m.lessons.some((l) => l.slug === slug)) return { level, module: m };
    }
  }
  return undefined;
}

/** Problems that would make navigation lie. Checked by tests and at build time. */
export function validateCatalogue(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const e of CURRICULUM_ORDER) {
    if (seen.has(e.slug)) problems.push(`duplicate curriculum slug "${e.slug}"`);
    seen.add(e.slug);
  }
  for (const [slug, lesson] of lessons()) {
    if (!seen.has(slug)) problems.push(`lesson "${slug}" has content but is not in the curriculum`);
    const entry = CURRICULUM_ORDER.find((e) => e.slug === slug);
    if (entry && entry.title !== lesson.title) {
      problems.push(`lesson "${slug}" title differs from curriculum ("${lesson.title}" vs "${entry.title}")`);
    }
    for (const p of lesson.prerequisites) {
      if (!seen.has(p)) problems.push(`lesson "${slug}" has unknown prerequisite "${p}"`);
      const pIndex = CURRICULUM_ORDER.findIndex((e) => e.slug === p);
      const sIndex = CURRICULUM_ORDER.findIndex((e) => e.slug === slug);
      if (pIndex > sIndex) problems.push(`lesson "${slug}" comes before its prerequisite "${p}"`);
    }
  }
  return problems;
}
