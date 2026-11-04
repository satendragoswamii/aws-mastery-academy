import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,27,45,0.04),0_4px_16px_rgba(15,27,45,0.04)] ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="flex items-center gap-2.5 text-base font-bold text-ink-900">
              {icon && (
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
              )}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons (links and buttons share one look)                          */
/* ------------------------------------------------------------------ */

const BUTTON = {
  primary:
    "bg-brand-500 text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50",
  secondary: "border border-slate-300 bg-white text-ink-800 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-ink-900",
  dark: "bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50",
} as const;

type Variant = keyof typeof BUTTON;
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed";

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${BUTTON[variant]} ${extra}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

const STATUS: Record<string, { label: string; className: string; Icon: typeof Circle }> = {
  not_started: { label: "Not started", className: "bg-slate-100 text-slate-600", Icon: Circle },
  in_progress: { label: "In progress", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", Icon: PlayCircle },
  needs_revision: {
    label: "Needs revision",
    className: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    Icon: RotateCcw,
  },
  mastered: {
    label: "Mastered",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Icon: CheckCircle2,
  },
  planned: { label: "Planned", className: "bg-slate-50 text-slate-400", Icon: Lock },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}
    >
      <s.Icon aria-hidden className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

const TIER: Record<string, { label: string; className: string }> = {
  verified_floci: { label: "Hands-on in Floci", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  partial_floci: { label: "Partly hands-on in Floci", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  conceptual: { label: "Concept lesson", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  requires_real_aws: { label: "Needs real AWS", className: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export function LabTierLabel({ tier }: { tier: string }) {
  const t = TIER[tier] ?? TIER.conceptual;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${t.className}`}>
      {t.label}
    </span>
  );
}

export function Pill({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function ProgressBar({ value, label, tone = "brand" }: { value: number; label: string; tone?: "brand" | "green" }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
    >
      <div
        className={`h-full rounded-full ${tone === "green" ? "bg-emerald-500" : "bg-gradient-to-r from-brand-400 to-brand-600"}`}
        style={{ width: `${Math.max(clamped, clamped > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

/** Circular progress, e.g. "section 3 of 14". */
export function ProgressRing({
  value,
  size = 72,
  label,
  children,
}: {
  value: number;
  size?: number;
  label: string;
  children?: ReactNode;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          className="text-brand-400"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-white">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty states                                                        */
/* ------------------------------------------------------------------ */

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <p className="mt-2 font-semibold text-ink-800">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-500">{children}</p>}
    </div>
  );
}
