import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {title && <h2 className="mb-3 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
  in_progress: { label: "In progress", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  needs_revision: { label: "Needs revision", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  mastered: { label: "Mastered", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  planned: { label: "Planned", className: "bg-transparent text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700" },
};

export function StatusBadge({ status }: { status: keyof typeof STATUS_STYLE | string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.not_started;
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${s.className}`}>
      {s.label}
    </span>
  );
}

const TIER: Record<string, { label: string; className: string }> = {
  verified_floci: { label: "✅ Verified in Floci", className: "text-emerald-700 dark:text-emerald-400" },
  partial_floci: { label: "◐ Partially supported in Floci", className: "text-amber-700 dark:text-amber-400" },
  conceptual: { label: "💭 Conceptual only", className: "text-zinc-600 dark:text-zinc-400" },
  requires_real_aws: { label: "☁️ Requires real AWS", className: "text-sky-700 dark:text-sky-400" },
};

export function LabTierLabel({ tier }: { tier: string }) {
  const t = TIER[tier] ?? TIER.conceptual;
  return <span className={`text-xs font-medium ${t.className}`}>{t.label}</span>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
