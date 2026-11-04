import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { loginAttempts } from "@/db/schema";
import { authenticate, LOCKOUT_WINDOW_MS, MAX_FAILED_ATTEMPTS } from "@/lib/auth/login";
import { resetDb, seedUser, testDb } from "../helpers/db";

const { db, sql } = testDb();
afterAll(() => sql.end());
beforeEach(() => resetDb(db));

describe("authenticate", () => {
  it("accepts correct credentials, case-insensitive username", async () => {
    const user = await seedUser(db);
    expect(await authenticate(db, "  LEARNER ", user.password)).toEqual({ ok: true, userId: user.id });
  });

  it("gives the same answer for wrong password and unknown user", async () => {
    await seedUser(db);
    expect(await authenticate(db, "learner", "wrong-password")).toEqual({ ok: false, reason: "invalid" });
    expect(await authenticate(db, "nobody", "wrong-password")).toEqual({ ok: false, reason: "invalid" });
  });

  it("records every attempt", async () => {
    const user = await seedUser(db);
    await authenticate(db, "learner", "wrong-password");
    await authenticate(db, "learner", user.password);
    const rows = await db.select().from(loginAttempts);
    expect(rows.map((r) => r.success)).toEqual([false, true]);
  });

  it(`locks out after ${MAX_FAILED_ATTEMPTS} failures, even with the right password`, async () => {
    const user = await seedUser(db);
    const t0 = new Date();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await authenticate(db, "learner", "wrong-password", new Date(t0.getTime() + i * 1000));
    }
    expect(await authenticate(db, "learner", user.password, new Date(t0.getTime() + 10_000))).toEqual({
      ok: false,
      reason: "locked",
    });
  });

  it("unlocks once the failures fall outside the window", async () => {
    const user = await seedUser(db);
    const t0 = new Date("2026-01-01T00:00:00Z");
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await authenticate(db, "learner", "wrong-password", t0);
    }
    const later = new Date(t0.getTime() + LOCKOUT_WINDOW_MS + 1000);
    expect(await authenticate(db, "learner", user.password, later)).toMatchObject({ ok: true });
  });

  it("a successful login resets the failure count", async () => {
    const user = await seedUser(db);
    const t0 = new Date();
    const at = (s: number) => new Date(t0.getTime() + s * 1000);
    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) await authenticate(db, "learner", "nope-nope-1", at(i));
    expect(await authenticate(db, "learner", user.password, at(10))).toMatchObject({ ok: true });
    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) await authenticate(db, "learner", "nope-nope-1", at(20 + i));
    expect(await authenticate(db, "learner", user.password, at(40))).toMatchObject({ ok: true });
  });
});
