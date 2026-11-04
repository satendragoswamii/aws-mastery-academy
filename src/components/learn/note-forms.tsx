"use client";

import { useActionState, useState } from "react";
import {
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
  type NoteFormState,
} from "@/app/actions/learning";

const initial: NoteFormState = { error: null, savedAt: null, body: null };

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
      <label htmlFor="new-note" className="text-sm text-zinc-500">
        New note
      </label>
      <textarea
        key={`${state.savedAt}-${state.error}`}
        defaultValue={state.body ?? ""}
        id="new-note"
        name="body"
        required
        rows={3}
        placeholder="Write what you understood, a question, or a command to remember…"
        className="w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
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
          className="w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
        />
        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <div className="flex gap-2 text-sm">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-3 py-1 text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-1">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <p className="whitespace-pre-wrap text-sm">{body}</p>
      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
        <span>{updatedAt}</span>
        <button type="button" onClick={() => setEditing(true)} className="underline">
          Edit
        </button>
        <form
          action={deleteNoteAction}
          onSubmit={(e) => {
            if (!confirm("Delete this note permanently?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-red-600 underline">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
