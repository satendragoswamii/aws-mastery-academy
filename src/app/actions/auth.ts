"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { env } from "@/lib/env";
import { authenticate } from "@/lib/auth/login";
import { createSession, deleteSession, SESSION_COOKIE } from "@/lib/auth/sessions";

export type LoginState = { error: string | null };

const credentials = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(200),
});

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your username and password." };

  const db = getDb();
  const result = await authenticate(db, parsed.data.username, parsed.data.password);
  if (!result.ok) {
    return {
      error:
        result.reason === "locked"
          ? "Too many failed attempts. Wait 15 minutes and try again."
          : "Incorrect username or password.",
    };
  }

  const { token, expiresAt } = await createSession(db, result.userId, env().SESSION_TTL_DAYS);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env().NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  redirect("/");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(getDb(), token);
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
