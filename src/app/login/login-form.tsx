"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";

const initial: LoginState = { error: null };

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Username
        <input name="username" autoComplete="username" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[15px] font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        <LogIn aria-hidden className="h-4 w-4" />
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
