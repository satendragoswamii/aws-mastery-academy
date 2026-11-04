/**
 * Creates the single learner account, or resets its password.
 * There is deliberately no sign-up page: this is a personal platform.
 *
 *   npm run user:create
 *   npm run user:reset-password
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { count, eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { learnerProfiles, sessions, users } from "../src/db/schema";
import { hashPassword, validatePasswordStrength } from "../src/lib/auth/password";
import { normaliseUsername } from "../src/lib/auth/login";

/** stdout wrapper that can be muted, so typed passwords are not echoed. */
class MutableStdout extends Writable {
  muted = false;
  _write(chunk: Buffer, _enc: BufferEncoding, cb: () => void) {
    if (!this.muted) process.stdout.write(chunk);
    cb();
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Run npm run setup:env first.");
  if (!process.stdin.isTTY) throw new Error("Run this in an interactive terminal.");

  const reset = process.argv.includes("--reset-password");
  const out = new MutableStdout();
  const rl = createInterface({ input: process.stdin, output: out, terminal: true });
  const ask = (q: string) => rl.question(q);
  const askHidden = async (q: string) => {
    process.stdout.write(q);
    out.muted = true;
    const answer = await rl.question("");
    out.muted = false;
    process.stdout.write("\n");
    return answer;
  };

  const { db, sql } = createDb(url, { max: 1 });
  try {
    const [{ n }] = await db.select({ n: count() }).from(users);

    if (!reset && n > 0) {
      console.log("An account already exists. Use `npm run user:reset-password` to change its password.");
      return;
    }
    if (reset && n === 0) {
      console.log("No account exists yet. Use `npm run user:create`.");
      return;
    }

    const username = normaliseUsername(await ask("Username: "));
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new Error("Username must be 3–32 characters: letters, digits, dot, dash, underscore.");
    }

    let existingId: string | undefined;
    if (reset) {
      const [u] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
      if (!u) throw new Error(`No user named "${username}".`);
      existingId = u.id;
    }
    const displayName = reset ? "" : (await ask("Display name: ")).trim() || username;

    const password = await askHidden("Password (min 10 chars): ");
    const problem = validatePasswordStrength(password);
    if (problem) throw new Error(problem);
    if ((await askHidden("Repeat password: ")) !== password) throw new Error("Passwords do not match.");

    const passwordHash = await hashPassword(password);

    if (existingId) {
      await db.transaction(async (tx) => {
        await tx.update(users).set({ passwordHash }).where(eq(users.id, existingId));
        await tx.delete(sessions).where(eq(sessions.userId, existingId)); // sign out everywhere
      });
      console.log("Password updated. All existing sessions were signed out.");
    } else {
      await db.transaction(async (tx) => {
        const [u] = await tx
          .insert(users)
          .values({ username, displayName, passwordHash })
          .returning({ id: users.id });
        await tx.insert(learnerProfiles).values({ userId: u.id });
      });
      console.log(`Account "${username}" created. Start the app with npm run dev and sign in.`);
    }
  } finally {
    rl.close();
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
