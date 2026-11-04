import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { getLesson, lessons } from "@/content/load";
import { SECTIONS } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProgressMap } from "@/lib/learning/progress";
import { LessonHeader } from "@/components/lesson-header";
import { Card, StatusBadge } from "@/components/ui";

export function generateStaticParams() {
  return [...lessons().keys()].map((slug) => ({ slug }));
}

export default async function LessonOverviewPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <div className="flex flex-col gap-6">
      <LessonHeader lesson={lesson} />
      <Suspense fallback={<div className="h-10" />}>
        <ContinueButton slug={slug} />
      </Suspense>
      <Card title="What this lesson covers">
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link href={`/learn/${slug}/${s.id}`} className="hover:underline">
                <span className="mr-2 font-mono text-zinc-500">{s.letter}</span>
                {s.title}
              </Link>
            </li>
          ))}
        </ol>
      </Card>
      {lesson.prerequisites.length > 0 && (
        <Card title="Before this lesson">
          <ul className="list-disc pl-5 text-sm">
            {lesson.prerequisites.map((p) => (
              <li key={p}>
                {getLesson(p) ? (
                  <Link className="underline" href={`/learn/${p}`}>{getLesson(p)!.title}</Link>
                ) : (
                  p
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

async function ContinueButton({ slug }: { slug: string }) {
  const user = await getCurrentUser();
  await connection();
  const progress = (await getProgressMap(getDb(), user.id)).get(slug);
  const section = progress?.currentSection ?? SECTIONS[0].id;
  const label = progress ? `Continue at ${SECTIONS.find((s) => s.id === section)?.title}` : "Start lesson";
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/learn/${slug}/${section}`}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        {label}
      </Link>
      <StatusBadge status={progress?.status ?? "not_started"} />
    </div>
  );
}
