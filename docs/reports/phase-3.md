# Phase 3 report: dashboard and learning navigation

**Date:** 2026-11-04  **Status:** complete, awaiting approval for Phase 4

## Delivered

- **App shell** with navigation: Dashboard · Curriculum · Notes & bookmarks · System.
- **Dashboard**, all computed from real records:
  - resume card that opens the exact section you stopped at
  - recommended next lesson, with a reason
  - learning streak (current and longest, in your own time zone)
  - overall progress: mastered/total, started, available, services studied, assessments taken
  - quiz average, weak topics (below 70%) and revision suggestions; these show "none yet" until Phase 10 produces assessment records
  - recent bookmarks and notes
- **Curriculum browser:** all 92 lessons across 3 levels and 24 modules, with your status per lesson. Planned lessons are visible but can't be opened.
- **Lesson overview and section viewer:** one section at a time (A–N), sidebar, previous/next, then on to the next available lesson. Lab-tier label, Floci-verified date and exam badges.
  - Terminology cards (simple, technical, example, why it matters).
  - Interview questions with hidden model answers.
  - **Self-check:** hints one at a time; the model answer unlocks only after you write your own answer. Not graded (Phase 10).
- **Notes** (per lesson and general): create, edit, delete with confirmation. Text is kept when a save is rejected.
- **Bookmarks** per section, toggled in the lesson and listed on the dashboard and the notes page.
- **Content system:** a lesson folder (YAML plus Markdown per section), validated against the 14-section schema.
- **Lesson 1 written in full:** *What is cloud computing?* Its S3 commands were run on Floci 2.4.0 before publishing.

## Verification

| Check | Result |
|---|---|
| Unit + integration (`FLOCI_LIVE=1 npm test`) | **74/74 passed** (40 → 74) |
| Browser E2E (`npm run test:e2e`, Playwright) | **8/8 passed** |
| `lint`, `typecheck`, `build` | clean, no warnings |
| Visual check (screenshots) | dashboard, section text, diagrams, terminology reviewed |

The E2E flows tested were:
- sign-in redirect
- a new learner sees zero progress
- section-by-section reading, then resume from the dashboard
- the streak counts
- reading doesn't count as mastery
- the curriculum shows status, and planned lessons can't be opened
- bookmarks toggle
- notes: create, edit, rejected save keeps the text, delete
- self-check gating
- sign-out

## Bugs found by tests and fixed

1. **Second visit to a lesson crashed.** A raw-SQL timestamp parameter couldn't be serialised by postgres.js. Fixed by passing an ISO string with a `::timestamptz` cast. This would have hit on the very first revisit.
2. **Rejected notes lost their text.** React resets forms after an action. The server now echoes the text back on a rejected save.
3. **Diagram misalignment.** Wide arrow glyphs (▲►◄▼) render wider than one column. Replaced with ASCII.

## Floci finding recorded in lesson content

Floci accepted the bucket name `Bad_Name`, which real AWS rejects. The lesson states this explicitly.

## Known limitations

- Visiting a planned or unknown lesson URL shows the 404 page, but with HTTP status 200. That's documented Next.js streaming behaviour (the status is sent before the layout's Suspense boundary resolves). The page is marked `noindex`.
- Only lesson 1 has content. Phase 4 writes the remaining Level 1 and Level 2 lessons.

## Untouched

The Floci container and its data (both test buckets were deleted after verification; `smoke` was untouched), `~/.aws`, Colima and Docker config, and your real app database (all tests used `academy_test`).
