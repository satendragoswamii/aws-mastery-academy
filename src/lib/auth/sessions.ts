import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import type { Db } from "@/db/client";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "ama_session";

/** 32 random bytes, base64url. This is what lives in the cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** The DB stores only the hash, so a stolen database cannot be used to log in. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(db: Db, userId: string, ttlDays: number, now = new Date()) {
  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: hashSessionToken(token), userId, expiresAt });
  return { token, expiresAt };
}

export type SessionUser = { id: string; username: string; displayName: string };

/** Returns the user for a valid, unexpired token, or null. */
export async function validateSessionToken(
  db: Db,
  token: string | undefined,
  now = new Date(),
): Promise<SessionUser | null> {
  if (!token || token.length > 200) return null;
  const rows = await db
    .select({ id: users.id, username: users.username, displayName: users.displayName })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashSessionToken(token)), gt(sessions.expiresAt, now)))
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashSessionToken(token)));
}

export async function deleteExpiredSessions(db: Db, now = new Date()): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}
