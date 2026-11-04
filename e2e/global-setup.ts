import "dotenv/config";
import { runMigrations } from "../src/db/migrate";
import { resetDb, seedUser, testDb } from "../tests/helpers/db";

export const E2E_USER = { username: "e2e", password: "e2e-password-123" };

/** Fresh TEST database with one known user before the browser tests run. */
export default async function globalSetup() {
  const url = process.env.TEST_DATABASE_URL!;
  if (url === process.env.DATABASE_URL) throw new Error("Refusing to run e2e against the app database");
  await runMigrations(url);
  const { db, sql } = testDb();
  await resetDb(db);
  await seedUser(db, E2E_USER.username, E2E_USER.password);
  await sql.end();
}
