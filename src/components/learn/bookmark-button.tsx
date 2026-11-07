"use client";

import { useActionState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
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
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
          state.bookmarked
            ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
            : "text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-ink-900"
        }`}
      >
        {state.bookmarked ? (
          <>
            <BookmarkCheck aria-hidden className="h-4 w-4" /> Bookmarked
          </>
        ) : (
          <>
            <Bookmark aria-hidden className="h-4 w-4" /> Bookmark this section
          </>
        )}
      </button>
    </form>
  );
}
