/**
 * Applies pending SQL migrations from ./drizzle.
 *
 *   npm run db:migrate          -> app database (DATABASE_URL)
 *   npm run db:migrate -- --test -> test database (TEST_DATABASE_URL)
 */
import "dotenv/config";
import path from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDb } from "../src/db/client";

export async function runMigrations(url: string) {
  const { db, sql } = createDb(url, { max: 1 });
  try {
    await migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, "../drizzle") });
  } finally {
    await sql.end();
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename;
if (isMain) {
  const useTest = process.argv.includes("--test");
  const url = useTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) {
    console.error(`${useTest ? "TEST_DATABASE_URL" : "DATABASE_URL"} is not set. Run npm run setup:env.`);
    process.exit(1);
  }
  runMigrations(url)
    .then(() => console.log(`Migrations applied to ${useTest ? "test" : "app"} database.`))
    .catch((e) => {
      console.error("Migration failed:", e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
