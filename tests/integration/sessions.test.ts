import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { sessions } from "@/db/schema";
import {
  createSession,
  deleteExpiredSessions,
  deleteSession,
  hashSessionToken,
  validateSessionToken,
} from "@/lib/auth/sessions";
import { resetDb, seedUser, testDb } from "../helpers/db";

const { db, sql } = testDb();
afterAll(() => sql.end());
beforeEach(() => resetDb(db));

describe("sessions", () => {
  it("creates a session that resolves to its user", async () => {
    const user = await seedUser(db);
    const { token } = await createSession(db, user.id, 14);
    expect(await validateSessionToken(db, token)).toMatchObject({ id: user.id, username: "learner" });
  });

  it("stores only the token hash, never the raw token", async () => {
    const user = await seedUser(db);
    const { token } = await createSession(db, user.id, 14);
    const rows = await db.select().from(sessions);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(hashSessionToken(token));
    expect(rows[0].id).not.toBe(token);
  });

  it("rejects unknown, missing, oversized and expired tokens", async () => {
    const user = await seedUser(db);
    const created = new Date("2026-01-01T00:00:00Z");
    const { token } = await createSession(db, user.id, 1, created);

    expect(await validateSessionToken(db, "not-a-real-token")).toBeNull();
    expect(await validateSessionToken(db, undefined)).toBeNull();
    expect(await validateSessionToken(db, "x".repeat(500))).toBeNull();
    expect(await validateSessionToken(db, token, new Date("2026-01-01T12:00:00Z"))).not.toBeNull();
    expect(await validateSessionToken(db, token, new Date("2026-01-02T00:00:01Z"))).toBeNull();
  });

  it("logout deletes the session", async () => {
    const user = await seedUser(db);
    const { token } = await createSession(db, user.id, 14);
    await deleteSession(db, token);
    expect(await validateSessionToken(db, token)).toBeNull();
  });

  it("cleans up expired sessions only", async () => {
    const user = await seedUser(db);
    await createSession(db, user.id, 1, new Date("2020-01-01T00:00:00Z"));
    const { token: live } = await createSession(db, user.id, 14);
    await deleteExpiredSessions(db);
    const rows = await db.select().from(sessions).where(eq(sessions.userId, user.id));
    expect(rows.map((r) => r.id)).toEqual([hashSessionToken(live)]);
  });
});
