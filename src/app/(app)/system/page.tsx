import { Suspense } from "react";
import { connection } from "next/server";
import { pingDb } from "@/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { checkFlociHealth } from "@/lib/floci/health";
import { Card } from "@/components/ui";

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">System status</h1>
      <Card title="Services">
        <Suspense fallback={<p className="text-sm text-zinc-500">Checking…</p>}>
          <SystemStatus />
        </Suspense>
      </Card>
    </div>
  );
}

async function SystemStatus() {
  await getCurrentUser();
  await connection();
  const [db, floci] = await Promise.all([pingDb(), checkFlociHealth(env().FLOCI_ENDPOINT)]);

  return (
    <div className="space-y-4 text-sm">
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
      {floci.reachable && (
        <details>
          <summary className="cursor-pointer text-zinc-500">
            Services Floci reports as running ({floci.runningServices.length})
          </summary>
          <p className="mt-2 font-mono text-xs leading-6 text-zinc-600 dark:text-zinc-400">
            {floci.runningServices.join(" · ")}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            &quot;Running&quot; means the service answers requests. It does not mean every API
            operation is supported. Each lab states its own verified support level.
          </p>
        </details>
      )}
    </div>
  );
}

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <span
        aria-label={ok ? "ok" : "problem"}
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-zinc-500">{detail}</span>
      </span>
    </div>
  );
}
