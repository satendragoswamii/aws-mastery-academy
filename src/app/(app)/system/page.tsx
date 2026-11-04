import { Suspense } from "react";
import { connection } from "next/server";
import { CheckCircle2, Database, FlaskConical, XCircle } from "lucide-react";
import { pingDb } from "@/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { checkFlociHealth } from "@/lib/floci/health";
import { Card } from "@/components/ui";

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">System status</h1>
        <p className="mt-2 text-slate-600">Checked live every time you open this page.</p>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-slate-200/60" />}>
        <SystemStatus />
      </Suspense>
    </div>
  );
}

async function SystemStatus() {
  await getCurrentUser();
  await connection();
  const [db, floci] = await Promise.all([pingDb(), checkFlociHealth(env().FLOCI_ENDPOINT)]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StatusCard
        icon={<Database className="h-4 w-4" />}
        title="Learning database"
        ok={db.ok}
        detail={db.ok ? "Connected. Your progress is being saved." : db.error}
        fix={db.ok ? null : "Run: npm run db:up"}
      />
      <StatusCard
        icon={<FlaskConical className="h-4 w-4" />}
        title="Floci lab"
        ok={floci.reachable}
        detail={
          floci.reachable
            ? `Version ${floci.version ?? "unknown"} at ${floci.endpoint} · ${floci.runningServices.length} services running`
            : floci.error
        }
        fix={floci.reachable ? null : "Run: docker start floci"}
      >
        {floci.reachable && (
          <details className="mt-4 rounded-xl bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600">
              Services Floci reports as running ({floci.runningServices.length})
            </summary>
            <p className="mt-2 font-mono text-xs leading-6 text-slate-600">{floci.runningServices.join(" · ")}</p>
            <p className="mt-2 text-xs text-slate-500">
              &quot;Running&quot; means the service answers requests. It doesn&apos;t mean every API operation is
              supported. Each lab states its own verified support level.
            </p>
          </details>
        )}
      </StatusCard>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  ok,
  detail,
  fix,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  ok: boolean;
  detail: string;
  fix: string | null;
  children?: React.ReactNode;
}) {
  return (
    <Card title={title} icon={icon}>
      <div className={`flex gap-3 rounded-xl p-4 ${ok ? "bg-emerald-50 ring-1 ring-emerald-100" : "bg-red-50 ring-1 ring-red-100"}`}>
        {ok ? (
          <CheckCircle2 aria-label="ok" className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle aria-label="problem" className="h-5 w-5 shrink-0 text-red-600" />
        )}
        <div className="text-sm">
          <p className={`font-bold ${ok ? "text-emerald-800" : "text-red-800"}`}>{ok ? "Working" : "Not reachable"}</p>
          <p className="mt-0.5 text-slate-700">{detail}</p>
          {fix && <p className="mt-2 font-mono text-xs text-red-800">{fix}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}
