import { mkdtempSync, rmSync, cpSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LESSONS_DIR, loadAllLessons, loadLessonFromDir, LessonContentError } from "@/content/load";
import { SECTIONS } from "@/content/schema";
import { validateCatalogue } from "@/lib/learning/catalogue";

describe("authored lesson content", () => {
  const all = loadAllLessons();

  it("has at least one lesson and every lesson passes the 14-section schema", () => {
    expect(all.size).toBeGreaterThan(0); // loadAllLessons throws on any invalid lesson
  });

  it("curriculum and content agree (slugs, titles, prerequisites, order)", () => {
    expect(validateCatalogue()).toEqual([]);
  });

  it.each([...all.values()].map((l) => [l.slug, l]))("%s has all A–N sections", (_slug, lesson) => {
    for (const s of SECTIONS) expect(lesson.sections[s.id]).toBeTruthy();
  });

  it("lessons marked verified_floci record when and on which Floci version they were verified", () => {
    for (const l of all.values()) {
      if (l.labTier === "verified_floci") expect(l.verifiedOn).not.toBeNull();
    }
  });

  it("every Floci CLI command in lesson text uses the explicit local endpoint", () => {
    for (const l of all.values()) {
      for (const [id, text] of Object.entries(l.sections)) {
        if (typeof text !== "string") continue;
        for (const line of text.split("\n")) {
          const t = line.trim();
          const isOfflineHelp = /^aws(\s+[a-z0-9-]+)*\s+help\b/.test(t);
          if (!isOfflineHelp && /^aws\s+(s3|s3api|dynamodb|sqs|sns|lambda|iam|sts)\b/.test(t)) {
            throw new Error(`${l.slug}/${id}: command without --endpoint-url: ${t}`);
          }
          if (/^aws\s+--endpoint-url\s/.test(t)) expect(t).toContain("--endpoint-url http://localhost:4566");
        }
      }
    }
  });
});

describe("lesson loader rejects broken content", () => {
  let dir: string | undefined;
  afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

  function copyOfFirstLesson() {
    dir = mkdtempSync(path.join(tmpdir(), "ama-lesson-"));
    const target = path.join(dir, "what-is-cloud-computing");
    cpSync(path.join(LESSONS_DIR, "what-is-cloud-computing"), target, { recursive: true });
    return target;
  }

  it("fails when a section file is missing", () => {
    const d = copyOfFirstLesson();
    unlinkSync(path.join(d, "security.md"));
    expect(() => loadLessonFromDir(d)).toThrow(/missing security\.md/);
  });

  it("fails on placeholder text", () => {
    const d = copyOfFirstLesson();
    writeFileSync(path.join(d, "why.md"), "TODO: write this section properly later on, promise.");
    expect(() => loadLessonFromDir(d)).toThrow(LessonContentError);
  });

  it("fails when a section is too thin to teach anything", () => {
    const d = copyOfFirstLesson();
    writeFileSync(path.join(d, "how.md"), "It works.");
    expect(() => loadLessonFromDir(d)).toThrow(/too short/);
  });
});
