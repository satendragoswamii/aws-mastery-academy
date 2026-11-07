import type { Metadata } from "next";
import { Award, FlaskConical, GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · AWS Mastery Academy" };

const FEATURES = [
  { Icon: GraduationCap, title: "Learn from absolute zero", text: "Every idea explained simply first, then professionally." },
  { Icon: FlaskConical, title: "Practise safely", text: "Hands-on labs run on Floci, on your Mac. No AWS bill, ever." },
  { Icon: Award, title: "Get certification-ready", text: "Mapped to official AWS exam domains." },
];

export default function LoginPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      {/* Welcome panel */}
      <section className="relative hidden overflow-hidden border-r border-slate-200 bg-slate-50 p-12 text-ink-900 lg:flex lg:flex-col lg:justify-between">
        <div className="relative flex items-center gap-3">
          <BrandMark size="lg" />
          <span className="text-lg font-semibold tracking-tight">
            AWS Mastery Academy
          </span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Think like a cloud engineer, one lesson at a time.
          </h2>
          <ul className="mt-8 space-y-5">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="text-sm text-slate-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">Your personal academy · runs entirely on this Mac</p>
      </section>

      {/* Sign-in */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <span className="text-lg font-semibold">
              AWS Mastery Academy
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Welcome back</h1>
          <p className="mt-2 text-slate-600">Sign in to continue learning.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
