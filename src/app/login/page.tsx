import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · AWS Mastery Academy" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold">AWS Mastery Academy</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to continue learning.</p>
        <LoginForm />
      </div>
    </main>
  );
}
