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
import { ButtonLink, Card, StatusBadge } from "@/components/ui";

export function generateStaticParams() {
  return [...lessons().keys()].map((slug) => ({ slug }));
}

/** The 14 sections, grouped into the three stages of learning a topic. */
const STAGES = [
  { title: "Understand it", emoji: "🧠", ids: ["what", "why", "how", "terms", "architecture", "real-world"] },
  { title: "Try it", emoji: "🛠️", ids: ["demo", "cli", "troubleshooting", "security"] },
  { title: "Prove it", emoji: "🏆", ids: ["certification", "interview", "check", "assignment"] },
] as const;

export default async function LessonOverviewPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/learn" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-slate-500 hover:text-ink-900">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Curriculum
      </Link>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
            <div key={stage.title}>
              <p className="mb-2 text-sm font-bold text-ink-800">
                <span aria-hidden>{stage.emoji}</span> {stage.title}
              </p>
              <ol className="flex flex-col gap-1.5">
                {stage.ids.map((id) => {
                  const s = SECTIONS.find((x) => x.id === id)!;
                  const Icon = SECTION_ICONS[s.id];
                  return (
                    <li key={id}>
                      <Link
                        href={`/learn/${slug}/${id}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon aria-hidden className="h-4 w-4" />
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
      <ButtonLink href={`/learn/${slug}/${section}`} className="px-5 py-3 text-base">
        <PlayCircle aria-hidden className="h-5 w-5" />
        {label}
      </ButtonLink>
      <StatusBadge status={progress?.status ?? "not_started"} />
    </div>
  );
}
