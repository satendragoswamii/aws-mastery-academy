import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { lessonSchema, type Lesson } from "./schema";

/**
 * Lessons live in content/lessons/<slug>/:
 *   lesson.yaml           metadata + structured parts (terms, interview, check)
 *   <section-id>.md       one Markdown file per prose section (what.md, why.md, ...)
 *
 * Files are read and validated once per process. Invalid content throws with
 * the exact problem, so a broken lesson can never be shown half-rendered.
 */

const PROSE_SECTIONS = [
  "what",
  "why",
  "how",
  "architecture",
  "real-world",
  "demo",
  "cli",
  "troubleshooting",
  "security",
  "certification",
  "assignment",
] as const;

// turbopackIgnore: the build would otherwise trace the whole project. The content
// folder is explicitly included via outputFileTracingIncludes in next.config.ts.
export const LESSONS_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "lessons");

export class LessonContentError extends Error {
  constructor(slug: string, detail: string) {
    super(`Lesson "${slug}" is invalid: ${detail}`);
    this.name = "LessonContentError";
  }
}

export function loadLessonFromDir(dir: string): Lesson {
  const slug = path.basename(dir);
  const yamlPath = path.join(dir, "lesson.yaml");
  if (!existsSync(yamlPath)) throw new LessonContentError(slug, "missing lesson.yaml");

  const meta = parseYaml(readFileSync(yamlPath, "utf8")) ?? {};
  const prose: Record<string, string> = {};
  for (const id of PROSE_SECTIONS) {
    const file = path.join(dir, `${id}.md`);
    if (!existsSync(file)) throw new LessonContentError(slug, `missing ${id}.md`);
    prose[id] = readFileSync(file, "utf8");
  }

  const candidate = {
    ...meta,
    slug,
    sections: { ...prose, ...(meta.sections ?? {}) },
  };
  const result = lessonSchema.safeParse(candidate);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new LessonContentError(slug, issues);
  }
  return result.data;
}

export function loadAllLessons(dir = LESSONS_DIR): Map<string, Lesson> {
  const lessons = new Map<string, Lesson>();
  if (!existsSync(dir)) return lessons;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const lesson = loadLessonFromDir(path.join(dir, entry.name));
    lessons.set(lesson.slug, lesson);
  }
  return lessons;
}

let cache: Map<string, Lesson> | undefined;

/**
 * All authored lessons, validated.
 * Production caches them per process (restart or rebuild after adding lessons).
 * Development re-reads the folder so newly written lessons appear without a restart.
 */
export function lessons(): Map<string, Lesson> {
  if (process.env.NODE_ENV !== "production") return loadAllLessons();
  cache ??= loadAllLessons();
  return cache;
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons().get(slug);
}
