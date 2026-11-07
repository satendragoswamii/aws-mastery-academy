import type { SectionId } from "@/content/schema";

/**
 * The 14 lesson sections fall into three stages of learning. Each stage has one
 * colour, used consistently (sidebar, section header, overview, progress) so the
 * learner always knows what kind of section they are in.
 *
 * Class strings are written out in full so Tailwind can find them.
 */
export type StageId = "understand" | "practice" | "prove";

export const STAGES: { id: StageId; title: string; ids: readonly SectionId[] }[] = [
  { id: "understand", title: "Understand it", ids: ["what", "why", "how", "terms", "architecture", "real-world"] },
  { id: "practice", title: "Try it", ids: ["demo", "cli", "troubleshooting", "security"] },
  { id: "prove", title: "Prove it", ids: ["certification", "interview", "check", "assignment"] },
];

export const STAGE_STYLE: Record<
  StageId,
  {
    /** CSS colour used by lesson prose accents (headings marker, bullets, callouts). */
    accent: string;
    /** Soft icon tile. */
    tile: string;
    /** Coloured text (labels, active link). */
    text: string;
    /** Active sidebar border. */
    border: string;
    /** Small dot. */
    dot: string;
    /** Progress fill. */
    bar: string;
    /** Hover background for links. */
    hover: string;
    /** Very light panel background. */
    soft: string;
  }
> = {
  understand: {
    accent: "#0284c7",
    tile: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
    text: "text-sky-700",
    border: "border-sky-500",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    hover: "hover:bg-sky-50/70",
    soft: "bg-sky-50/50",
  },
  practice: {
    accent: "#059669",
    tile: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-500",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    hover: "hover:bg-emerald-50/70",
    soft: "bg-emerald-50/50",
  },
  prove: {
    accent: "#7c3aed",
    tile: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
    text: "text-violet-700",
    border: "border-violet-500",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
    hover: "hover:bg-violet-50/70",
    soft: "bg-violet-50/50",
  },
};

export function stageOf(section: SectionId): StageId {
  return STAGES.find((s) => s.ids.includes(section))?.id ?? "understand";
}

/** Colours for curriculum levels (Level 1, 2, 3). */
export const LEVEL_STYLE = [
  { badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", text: "text-sky-700", bar: "bg-sky-500", tint: "bg-sky-50/50" },
  { badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", text: "text-indigo-700", bar: "bg-indigo-500", tint: "bg-indigo-50/50" },
  { badge: "bg-teal-50 text-teal-700 ring-1 ring-teal-200", text: "text-teal-700", bar: "bg-teal-500", tint: "bg-teal-50/50" },
] as const;

/** How much of a lesson runs in the local lab. */
export const TIER_STYLE: Record<string, { label: string; dot: string; text: string }> = {
  verified_floci: { label: "Hands-on in Floci", dot: "bg-emerald-500", text: "text-emerald-700" },
  partial_floci: { label: "Partly hands-on in Floci", dot: "bg-amber-500", text: "text-amber-700" },
  conceptual: { label: "Concept lesson", dot: "bg-slate-400", text: "text-slate-600" },
  requires_real_aws: { label: "Needs real AWS", dot: "bg-sky-500", text: "text-sky-700" },
};
