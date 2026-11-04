import { z } from "zod";

/**
 * Every lesson follows the same 14-part teaching structure (A–N).
 * The order here IS the order the learner moves through a lesson.
 */
export const SECTIONS = [
  { id: "what", letter: "A", title: "What is it?" },
  { id: "why", letter: "B", title: "Why does it exist?" },
  { id: "how", letter: "C", title: "How does it work?" },
  { id: "terms", letter: "D", title: "Important terminology" },
  { id: "architecture", letter: "E", title: "Architecture" },
  { id: "real-world", letter: "F", title: "Real-world application" },
  { id: "demo", letter: "G", title: "Practical demonstration" },
  { id: "cli", letter: "H", title: "AWS CLI commands" },
  { id: "troubleshooting", letter: "I", title: "Troubleshooting" },
  { id: "security", letter: "J", title: "Security and best practices" },
  { id: "certification", letter: "K", title: "Certification relevance" },
  { id: "interview", letter: "L", title: "Interview preparation" },
  { id: "check", letter: "M", title: "Knowledge check" },
  { id: "assignment", letter: "N", title: "Independent assignment" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
export const SECTION_IDS = SECTIONS.map((s) => s.id) as SectionId[];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as string[]).includes(value);
}

/** Markdown text. Must say something real, not a placeholder. */
const md = z
  .string()
  .trim()
  .min(40, "section text is too short to teach anything")
  .refine((s) => !/\b(TODO|TBD|lorem ipsum)\b/i.test(s), "contains placeholder text");

export const termSchema = z.object({
  term: z.string().min(1),
  simple: z.string().min(10),
  technical: z.string().min(10),
  example: z.string().min(10),
  relevance: z.string().min(10),
});

export const interviewQuestionSchema = z.object({
  question: z.string().min(10),
  modelAnswer: z.string().min(20),
});

export const selfCheckSchema = z.object({
  question: z.string().min(10),
  /** Shown one at a time, before the answer. */
  hints: z.array(z.string().min(5)).min(1),
  answer: z.string().min(20),
});

/**
 * How honestly a lesson's practical part can run locally.
 * Mirrors the lab_tier enum in the database.
 */
export const labTierSchema = z.enum([
  "verified_floci",
  "partial_floci",
  "conceptual",
  "requires_real_aws",
]);

export const lessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(3),
  summary: z.string().min(20),
  estimatedMinutes: z.number().int().min(5).max(240),
  /** Lessons that should come first. Must exist in the curriculum. */
  prerequisites: z.array(z.string()),
  /** Topic tags used for weak-topic analysis across lessons and exams. */
  topics: z.array(z.string().min(2)).min(1),
  labTier: labTierSchema,
  /** When the practical commands were last run against Floci, and on which version. */
  verifiedOn: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), floci: z.string() }).nullable(),
  certifications: z
    .array(z.object({ exam: z.string().regex(/^[A-Z]{3}-C\d{2}$/), domain: z.string().min(3) }))
    .min(1),
  sections: z.object({
    what: md,
    why: md,
    how: md,
    terms: z.array(termSchema).min(3),
    architecture: md,
    "real-world": md,
    demo: md,
    cli: md,
    troubleshooting: md,
    security: md,
    certification: md,
    interview: z.object({
      beginner: z.array(interviewQuestionSchema).min(1),
      intermediate: z.array(interviewQuestionSchema).min(1),
      advanced: z.array(interviewQuestionSchema).min(1),
    }),
    check: z.array(selfCheckSchema).min(3),
    assignment: md,
  }),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type Term = z.infer<typeof termSchema>;
export type SelfCheck = z.infer<typeof selfCheckSchema>;
