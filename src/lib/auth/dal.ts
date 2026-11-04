import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { SESSION_COOKIE, validateSessionToken, type SessionUser } from "./sessions";

/**
 * Data Access Layer: the one place that turns a request cookie into a user.
 * Every protected Server Component, Server Action and Route Handler calls this,
 * so authorization never relies on the proxy or on the client.
 *
 * Reads cookies, so callers must render inside a <Suspense> boundary.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // Session expiry compares against the current time, so this must run at request time.
  await connection();
  const user = await validateSessionToken(getDb(), token, new Date());
  if (!user) redirect("/login");
  return user;
}
