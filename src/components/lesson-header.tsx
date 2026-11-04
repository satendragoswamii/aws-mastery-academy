import { Award, Clock, FlaskConical } from "lucide-react";
import type { Lesson } from "@/content/schema";
import { moduleAndLevelFor } from "@/lib/learning/catalogue";
import { LabTierLabel, Pill } from "./ui";

export function LessonMeta({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill>
        <Clock aria-hidden className="h-3.5 w-3.5" />~{lesson.estimatedMinutes} min
      </Pill>
      <LabTierLabel tier={lesson.labTier} />
      {lesson.verifiedOn && (
        <Pill title="Every lab command in this lesson was run against Floci before publishing">
          <FlaskConical aria-hidden className="h-3.5 w-3.5" />
          Commands tested {lesson.verifiedOn.date} · Floci {lesson.verifiedOn.floci}
        </Pill>
      )}
      {lesson.certifications.map((c) => (
        <Pill key={c.exam} title={c.domain}>
          <Award aria-hidden className="h-3.5 w-3.5" />
          {c.exam}
        </Pill>
      ))}
    </div>
  );
}

export function LessonBreadcrumb({ slug }: { slug: string }) {
  const place = moduleAndLevelFor(slug);
  if (!place) return null;
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
      Level {place.level.number} · {place.module.title}
    </p>
  );
}

export function LessonHeader({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <LessonBreadcrumb slug={lesson.slug} />
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">{lesson.title}</h1>
      <p className="mt-2 max-w-3xl text-lg text-slate-600">{lesson.summary}</p>
      <div className="mt-4">
        <LessonMeta lesson={lesson} />
      </div>
    </div>
  );
}
