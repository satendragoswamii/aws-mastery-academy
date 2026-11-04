"use client";

import { useEffect } from "react";
import { visitSection } from "@/app/actions/learning";

/**
 * Records progress only after the section has actually rendered in the browser.
 * Prefetching a page never runs effects, so prefetches can't fake progress.
 */
export function VisitTracker({ slug, section }: { slug: string; section: string }) {
  useEffect(() => {
    visitSection(slug, section).catch(() => {
      /* progress is best-effort; the lesson stays readable */
    });
  }, [slug, section]);
  return null;
}
