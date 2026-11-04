import "dotenv/config";
import { sql as rawSql } from "drizzle-orm";
import { createDb } from "@/db/client";
import { learnerProfiles, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

export function testDb() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set");
  return createDb(url, { max: 2 });
}

type TestDb = ReturnType<typeof testDb>["db"];

/** Empties every table in the TEST database. */
export async function resetDb(db: TestDb) {
  await db.execute(rawSql`
    TRUNCATE users, sessions, login_attempts, learner_profiles, lesson_progress,
             assessment_attempts, lab_runs, notes, bookmarks, activity_days
    RESTART IDENTITY CASCADE`);
}

export async function seedUser(db: TestDb, username = "learner", password = "correct-horse-battery") {
  const [u] = await db
    .insert(users)
    .values({ username, displayName: "Test Learner", passwordHash: await hashPassword(password) })
    .returning({ id: users.id });
  await db.insert(learnerProfiles).values({ userId: u.id });
  return { id: u.id, username, password };
}
