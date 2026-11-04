import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

/** Creates a database handle. Injected everywhere so tests can use the test database. */
export function createDb(url: string, options: { max?: number } = {}) {
  const sql = postgres(url, { max: options.max ?? 5, onnotice: () => {} });
  const db: Db = drizzle(sql, { schema });
  return { db, sql };
}
