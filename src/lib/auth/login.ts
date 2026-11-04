import { and, count, desc, eq, gt } from "drizzle-orm";
import type { Db } from "@/db/client";
import { loginAttempts, users } from "@/db/schema";
import { getDummyHash, verifyPassword } from "./password";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "locked" };

export function normaliseUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Counts failures since the later of (window start, last success). */
export async function isLockedOut(db: Db, username: string, now = new Date()): Promise<boolean> {
  const windowStart = new Date(now.getTime() - LOCKOUT_WINDOW_MS);

  const lastSuccess = await db
    .select({ at: loginAttempts.attemptedAt })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.username, username), eq(loginAttempts.success, true)))
    .orderBy(desc(loginAttempts.attemptedAt))
    .limit(1);

  const since =
    lastSuccess[0] && lastSuccess[0].at > windowStart ? lastSuccess[0].at : windowStart;

  const [{ failures }] = await db
    .select({ failures: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.username, username),
        eq(loginAttempts.success, false),
        gt(loginAttempts.attemptedAt, since),
      ),
    );
  return failures >= MAX_FAILED_ATTEMPTS;
}

export async function authenticate(
  db: Db,
  rawUsername: string,
  password: string,
  now = new Date(),
): Promise<LoginResult> {
  const username = normaliseUsername(rawUsername);
  if (!username || !password) return { ok: false, reason: "invalid" };

  if (await isLockedOut(db, username, now)) {
    return { ok: false, reason: "locked" };
  }

  const found = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  // Always run bcrypt so response time does not reveal whether the user exists.
  const valid = await verifyPassword(password, found[0]?.passwordHash ?? (await getDummyHash()));
  const success = Boolean(found[0]) && valid;

  await db.insert(loginAttempts).values({ username, success, attemptedAt: now });

  return success ? { ok: true, userId: found[0].id } : { ok: false, reason: "invalid" };
}
