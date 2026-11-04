import type { Metadata } from "next";
import { Award, Cloud, FlaskConical, GraduationCap } from "lucide-react";
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
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Cloud aria-hidden className="pointer-events-none absolute -right-16 -top-10 h-80 w-80 text-white/5" />
        <Cloud aria-hidden className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 text-white/5" />
        <div className="relative flex items-center gap-3">
          <BrandMark size="lg" />
          <span className="text-xl font-extrabold tracking-tight">
            AWS Mastery <span className="text-brand-400">Academy</span>
          </span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
            Think like a <span className="text-brand-400">cloud engineer</span>, one lesson at a time.
          </h2>
          <ul className="mt-8 space-y-5">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-300">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="text-sm text-slate-300">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">Your personal academy · runs entirely on this Mac</p>
      </section>

      {/* Sign-in */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <span className="text-lg font-extrabold">
              AWS Mastery <span className="text-brand-500">Academy</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Welcome back 👋</h1>
          <p className="mt-2 text-slate-600">Sign in to continue learning.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
