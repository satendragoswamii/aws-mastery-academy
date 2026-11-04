import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** The session id is the SHA-256 of the cookie token, so a DB leak cannot be replayed. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Used to throttle repeated failed logins. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    success: boolean("success").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_lookup_idx").on(t.username, t.attemptedAt)],
);

/* ------------------------------------------------------------------ */
/* Learner profile & progress                                          */
/* ------------------------------------------------------------------ */

export const learnerLevel = pgEnum("learner_level", [
  "absolute_beginner",
  "beginner",
  "intermediate",
  "advanced",
]);

export const learnerProfiles = pgTable("learner_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  level: learnerLevel("level").notNull().default("absolute_beginner"),
  /** e.g. "CLF-C02". Free text so new exam codes need no migration. */
  certificationGoal: text("certification_goal"),
  /** Exact resume point. */
  currentLessonSlug: text("current_lesson_slug"),
  currentSection: text("current_section"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonStatus = pgEnum("lesson_status", [
  "not_started",
  "in_progress",
  "needs_revision",
  "mastered",
]);

/**
 * Status is never set to "mastered" by just reading a lesson;
 * the assessment engine (Phase 10) promotes it from real attempts.
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    status: lessonStatus("status").notNull().default("not_started"),
    currentSection: text("current_section"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    masteredAt: timestamp("mastered_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug] })],
);

export const assessmentKind = pgEnum("assessment_kind", [
  "quiz",
  "free_response",
  "lab_check",
  "practice_test",
  "mock_exam",
]);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug"),
    /** Topic tags let the weak-topic analysis work across lessons and exams. */
    topics: text("topics").array().notNull().default([]),
    kind: assessmentKind("kind").notNull(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull(),
    /** Per-question answers, hints used, grader feedback. */
    details: jsonb("details").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("assessment_user_time_idx").on(t.userId, t.createdAt)],
);

export const labTier = pgEnum("lab_tier", [
  "verified_floci",
  "partial_floci",
  "conceptual",
  "requires_real_aws",
]);

/** Exact log of every lab command: what ran, against which endpoint, and what happened. */
export const labRuns = pgTable(
  "lab_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    labId: text("lab_id").notNull(),
    argv: text("argv").array().notNull(),
    endpoint: text("endpoint").notNull(),
    exitCode: integer("exit_code"),
    stdout: text("stdout").notNull().default(""),
    stderr: text("stderr").notNull().default(""),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lab_runs_user_lab_idx").on(t.userId, t.labId)],
);

/* ------------------------------------------------------------------ */
/* Personal tools                                                      */
/* ------------------------------------------------------------------ */

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_user_lesson_idx").on(t.userId, t.lessonSlug)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    section: text("section").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug, t.section] })],
);

/** One row per day with real learning activity; drives the streak. */
export const activityDays = pgTable(
  "activity_days",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);
