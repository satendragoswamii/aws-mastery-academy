"use client";

import { useActionState, useState } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import {
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
  type NoteFormState,
} from "@/app/actions/learning";

const initial: NoteFormState = { error: null, savedAt: null, body: null };

const textareaClass =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

/*
 * React resets a <form action> after submission. On a rejected save the server
 * returns the text in `state.body`, and keying the textarea on the state
 * restores it, so a note is never lost to a validation error.
 */

export function AddNoteForm({ slug }: { slug: string | null }) {
  const [state, action, pending] = useActionState(addNoteAction, initial);

  return (
    <form action={action} className="flex flex-col gap-2">
      {slug && <input type="hidden" name="slug" value={slug} />}
      <label htmlFor="new-note" className="text-sm font-semibold text-slate-600">
        New note
      </label>
      <textarea
        key={`${state.savedAt}-${state.error}`}
        defaultValue={state.body ?? ""}
        id="new-note"
        name="body"
        required
        rows={3}
        placeholder="What did you understand? A question? A command to remember?"
        className={textareaClass}
      />
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 self-start rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
      >
        <Save aria-hidden className="h-4 w-4" />
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}

export function NoteItem({ id, body, updatedAt }: { id: string; body: string; updatedAt: string }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev: NoteFormState, fd: FormData) => {
    const result = await updateNoteAction(prev, fd);
    if (!result.error) setEditing(false);
    return result;
  }, initial);

  if (editing) {
    return (
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <textarea
          key={`${state.savedAt}-${state.error}`}
          name="body"
          defaultValue={state.body ?? body}
          required
          rows={4}
          aria-label="Edit note"
          className={textareaClass}
        />
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {state.error}
          </p>
        )}
        <div className="flex gap-2 text-sm">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-ink-900 px-4 py-1.5 font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl border border-slate-300 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">{body}</p>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <span className="mr-2">{updatedAt}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold hover:bg-white hover:text-ink-900"
        >
          <Pencil aria-hidden className="h-3.5 w-3.5" /> Edit
        </button>
        <form
          action={deleteNoteAction}
          onSubmit={(e) => {
            if (!confirm("Delete this note permanently?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>
    </div>
  );
}
