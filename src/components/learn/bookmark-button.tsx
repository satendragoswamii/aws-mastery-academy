"use client";

import { useActionState } from "react";
import { toggleBookmarkAction, type BookmarkState } from "@/app/actions/learning";

export function BookmarkButton({
  slug,
  section,
  initial,
}: {
  slug: string;
  section: string;
  initial: boolean;
}) {
  const [state, action, pending] = useActionState<BookmarkState, FormData>(toggleBookmarkAction, {
    bookmarked: initial,
  });
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="section" value={section} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={state.bookmarked}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {state.bookmarked ? "🔖 Bookmarked" : "Bookmark this section"}
      </button>
    </form>
  );
}
