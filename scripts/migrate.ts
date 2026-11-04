/**
 * Applies pending SQL migrations from ./drizzle. Run from the project root.
 *
 *   npm run db:migrate           -> app database (DATABASE_URL)
 *   npm run db:migrate -- --test -> test database (TEST_DATABASE_URL)
 */
import "dotenv/config";
import { runMigrations } from "../src/db/migrate";

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
