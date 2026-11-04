import "server-only";
import { env } from "@/lib/env";
import { createDb, type Db } from "./client";

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { __amaDb?: ReturnType<typeof createDb> };

export function getDb(): Db {
  globalForDb.__amaDb ??= createDb(env().DATABASE_URL);
  return globalForDb.__amaDb.db;
}

/** Lightweight liveness check for the status panel. */
export async function pingDb(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    globalForDb.__amaDb ??= createDb(env().DATABASE_URL);
    await globalForDb.__amaDb.sql`select 1`;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
