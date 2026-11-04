import "dotenv/config";
import { runMigrations } from "../src/db/migrate";

/** Brings the TEST database schema up to date before any test runs. Never touches the app DB. */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set. Run npm run setup:env.");
  if (url === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL — tests wipe their database.");
  }
  try {
    await runMigrations(url);
  } catch (e) {
    throw new Error(
      `Cannot prepare the test database (${e instanceof Error ? e.message : e}). Is Postgres running? npm run db:up`,
    );
  }
}
