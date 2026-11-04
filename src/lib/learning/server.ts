import "server-only";
import { getDb } from "@/db";
import { lessons } from "@/content/load";
import { env } from "@/lib/env";
import { catalogue } from "./catalogue";
import { buildDashboard } from "./dashboard";
import { getActiveDays, getAssessmentAttempts, getProfile, getProgressMap } from "./progress";
import { dayInZone } from "./streak";

/** Everything the dashboard needs for one user, from real records. */
export async function loadDashboard(userId: string, now = new Date()) {
  const db = getDb();
  const [progress, profile, activeDays, attempts] = await Promise.all([
    getProgressMap(db, userId),
    getProfile(db, userId),
    getActiveDays(db, userId),
    getAssessmentAttempts(db, userId),
  ]);
  return {
    profile,
    dashboard: buildDashboard({
      catalogue: catalogue(),
      lessons: lessons(),
      progress,
      resume: {
        lessonSlug: profile?.currentLessonSlug ?? null,
        section: profile?.currentSection ?? null,
      },
      activeDays,
      today: dayInZone(now, env().APP_TIMEZONE),
      attempts,
    }),
  };
}
