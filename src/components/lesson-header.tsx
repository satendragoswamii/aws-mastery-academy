import type { Lesson } from "@/content/schema";
import { moduleAndLevelFor } from "@/lib/learning/catalogue";
import { LabTierLabel } from "./ui";

export function LessonHeader({ lesson, compact = false }: { lesson: Lesson; compact?: boolean }) {
  const place = moduleAndLevelFor(lesson.slug);
  return (
    <div>
      {place && (
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Level {place.level.number} · {place.module.title}
        </p>
      )}
      <h1 className={compact ? "text-xl font-semibold" : "text-2xl font-semibold"}>{lesson.title}</h1>
      {!compact && <p className="mt-1 max-w-3xl text-zinc-600 dark:text-zinc-300">{lesson.summary}</p>}
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span>~{lesson.estimatedMinutes} min</span>
        <LabTierLabel tier={lesson.labTier} />
        {lesson.verifiedOn && (
          <span>
            Commands verified {lesson.verifiedOn.date} on Floci {lesson.verifiedOn.floci}
          </span>
        )}
        {lesson.certifications.map((c) => (
          <span key={c.exam} className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800" title={c.domain}>
            {c.exam}
          </span>
        ))}
      </p>
    </div>
  );
}
