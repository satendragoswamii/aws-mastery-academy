import { Suspense } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, pingDb } from "@/db";
import { learnerProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { checkFlociHealth } from "@/lib/floci/health";
import { logout } from "@/app/actions/auth";

/**
 * Phase 2 home: identity, learner profile and system status — all real data.
 * The full learning dashboard is built in Phase 3.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <Suspense fallback={<div className="h-12" />}>
        <Header />
      </Suspense>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold">Your learning profile</h2>
        <Suspense fallback={<p className="mt-2 text-sm text-zinc-500">Loading…</p>}>
          <Profile />
        </Suspense>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold">System status</h2>
        <Suspense fallback={<p className="mt-2 text-sm text-zinc-500">Checking…</p>}>
          <SystemStatus />
        </Suspense>
      </section>
    </main>
  );
}

async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">AWS Mastery Academy</h1>
        <p className="text-sm text-zinc-500">Signed in as {user.displayName}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}

const LEVEL_LABEL: Record<string, string> = {
  absolute_beginner: "Absolute beginner",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

async function Profile() {
  const user = await getCurrentUser();
  const [profile] = await getDb()
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.id))
    .limit(1);

  return (
    <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-sm">
      <dt className="text-zinc-500">Level</dt>
      <dd>{profile ? LEVEL_LABEL[profile.level] : "Not set"}</dd>
      <dt className="text-zinc-500">Certification goal</dt>
      <dd>{profile?.certificationGoal ?? "Not set yet"}</dd>
      <dt className="text-zinc-500">Resume point</dt>
      <dd>
        {profile?.currentLessonSlug
          ? `${profile.currentLessonSlug} › ${profile.currentSection ?? "start"}`
          : "No lesson started yet. Lessons arrive in Phase 4."}
      </dd>
    </dl>
  );
}

async function SystemStatus() {
  await connection(); // request-time check, never prerendered
  await getCurrentUser();
  const [db, floci] = await Promise.all([pingDb(), checkFlociHealth(env().FLOCI_ENDPOINT)]);

  return (
    <ul className="mt-3 space-y-2 text-sm">
      <StatusRow ok={db.ok} label="Database (PostgreSQL)" detail={db.ok ? "Connected" : db.error} />
      <StatusRow
        ok={floci.reachable}
        label={`Floci at ${floci.endpoint}`}
        detail={
          floci.reachable
            ? `Version ${floci.version ?? "unknown"} · ${floci.runningServices.length} services reporting running`
            : floci.error
        }
      />
    </ul>
  );
}

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex gap-3">
      <span
        aria-label={ok ? "ok" : "problem"}
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-zinc-500">{detail}</span>
      </span>
    </li>
  );
}
