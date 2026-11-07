"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import type { SelfCheck } from "@/content/schema";

const MIN_ATTEMPT = 15;

/**
 * Self-check: write your own answer first, take hints one at a time, and only
 * then compare with the model answer. Not graded or stored. Graded
 * assessments arrive in Phase 10.
 */
export function SelfCheckItem({ item, index }: { item: SelfCheck; index: number }) {
  const [attempt, setAttempt] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const canReveal = attempt.trim().length >= MIN_ATTEMPT;

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex gap-3">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </span>
        <p className="font-medium leading-relaxed text-ink-900">{item.question}</p>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-600" htmlFor={`attempt-${index}`}>
        Your answer, in your own words
      </label>
      <textarea
        id={`attempt-${index}`}
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        rows={3}
        placeholder="Type your answer here…"
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-[15px] outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      {hintsShown > 0 && (
        <ol className="mt-3 space-y-2 text-sm">
          {item.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700">
              <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong>Hint {i + 1}:</strong> {h}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!revealed && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {hintsShown < item.hints.length && (
            <button
              type="button"
              onClick={() => setHintsShown((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              <Lightbulb aria-hidden className="h-4 w-4" />
              {hintsShown === 0 ? "Give me a hint" : "Another hint"}
            </button>
          )}
          <button
            type="button"
            disabled={!canReveal}
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            title={canReveal ? undefined : "Write your own answer first"}
          >
            <CheckCircle2 aria-hidden className="h-4 w-4" />
            Compare with model answer
          </button>
          {!canReveal && <span className="text-xs text-slate-500">Write at least a sentence first</span>}
        </div>
      )}

      {revealed && (
        <div className="mt-4 rounded-lg border-l-[3px] border-emerald-500 bg-slate-50 p-4 text-[15px]">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 aria-hidden className="h-4 w-4" /> Model answer
          </p>
          <p className="mt-1.5 leading-relaxed text-slate-700">{item.answer}</p>
          <p className="mt-3 text-xs text-slate-500">
            Compare honestly: did you cover the same key ideas? If not, re-read the relevant section. This
            self-check isn&apos;t graded or saved.
          </p>
        </div>
      )}
    </div>
  );
}
