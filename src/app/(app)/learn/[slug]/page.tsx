import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ListChecks, PlayCircle } from "lucide-react";
import { getDb } from "@/db";
import { getLesson, lessons } from "@/content/load";
import { SECTIONS } from "@/content/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProgressMap } from "@/lib/learning/progress";
import { LessonHeader } from "@/components/lesson-header";
import { SECTION_ICONS } from "@/components/learn/section-icons";
import { STAGES, STAGE_STYLE } from "@/components/learn/stage-colors";
import { ButtonLink, Card, StatusBadge } from "@/components/ui";

export function generateStaticParams() {
  return [...lessons().keys()].map((slug) => ({ slug }));
}


export default async function LessonOverviewPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <Link href="/learn" className="inline-flex items-center gap-1 self-start text-sm font-medium text-slate-500 hover:text-ink-900">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Curriculum
      </Link>

      <section className="border-b border-slate-200 pb-8">
        <LessonHeader lesson={lesson} />
        <div className="mt-6">
          <Suspense fallback={<div className="h-11" />}>
            <ContinueButton slug={slug} />
          </Suspense>
        </div>
      </section>

      <Card title="What you'll do in this lesson" icon={<ListChecks className="h-4 w-4" />}>
        <div className="grid gap-6 md:grid-cols-3">
          {STAGES.map((stage) => (
            <div key={stage.title} className={`rounded-lg p-3 ${STAGE_STYLE[stage.id].soft}`}>
              <p className={`mb-2 flex items-center gap-2 px-2.5 text-sm font-semibold ${STAGE_STYLE[stage.id].text}`}>
                <span aria-hidden className={`h-2 w-2 rounded-full ${STAGE_STYLE[stage.id].dot}`} />
                {stage.title}
              </p>
              <ol className="flex flex-col gap-1.5">
                {stage.ids.map((id) => {
                  const s = SECTIONS.find((x) => x.id === id)!;
                  const Icon = SECTION_ICONS[s.id];
                  return (
                    <li key={id}>
                      <Link
                        href={`/learn/${slug}/${id}`}
                        className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:text-ink-900"
                      >
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${STAGE_STYLE[stage.id].tile}`}>
                          <Icon aria-hidden className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="mr-1.5 font-mono text-xs text-slate-400">{s.letter}</span>
                          {s.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </Card>

      {lesson.prerequisites.length > 0 && (
        <Card title="Before this lesson">
          <ul className="list-disc pl-5 text-sm">
            {lesson.prerequisites.map((p) => (
              <li key={p}>
                {getLesson(p) ? (
                  <Link className="underline" href={`/learn/${p}`}>
                    {getLesson(p)!.title}
                  </Link>
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
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink href={`/learn/${slug}/${section}`} className="px-5 py-2.5">
        <PlayCircle aria-hidden className="h-4 w-4" />
        {label}
      </ButtonLink>
      <StatusBadge status={progress?.status ?? "not_started"} />
    </div>
  );
}
