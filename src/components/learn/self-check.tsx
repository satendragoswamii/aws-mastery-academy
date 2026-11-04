"use client";

import { useState } from "react";
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
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="font-medium">
        {index + 1}. {item.question}
      </p>

      <label className="mt-3 block text-sm text-zinc-500" htmlFor={`attempt-${index}`}>
        Your answer, in your own words
      </label>
      <textarea
        id={`attempt-${index}`}
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
      />

      {hintsShown > 0 && (
        <ol className="mt-3 space-y-1 text-sm">
          {item.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className="rounded bg-sky-50 px-3 py-2 dark:bg-sky-950">
              💡 Hint {i + 1}: {h}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {hintsShown < item.hints.length && !revealed && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => n + 1)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
          >
            {hintsShown === 0 ? "Give me a hint" : "Another hint"}
          </button>
        )}
        {!revealed && (
          <button
            type="button"
            disabled={!canReveal}
            onClick={() => setRevealed(true)}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            title={canReveal ? undefined : "Write your own answer first"}
          >
            Compare with model answer
          </button>
        )}
      </div>
      {!canReveal && !revealed && (
        <p className="mt-2 text-xs text-zinc-500">Write at least a sentence before you can see the model answer.</p>
      )}

      {revealed && (
        <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm dark:bg-emerald-950">
          <p className="font-medium">Model answer</p>
          <p className="mt-1">{item.answer}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Compare honestly: did you cover the same key ideas? If not, re-read the relevant section.
            This self-check isn&apos;t graded or saved.
          </p>
        </div>
      )}
    </div>
  );
}
