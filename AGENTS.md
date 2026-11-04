<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (AWS Mastery Academy)

- **Never call real AWS.** Every AWS endpoint goes through `assertLocalEndpoint` (`src/lib/floci/endpoint.ts`). Never bypass it, and never rely on the user's default AWS profile (it has no endpoint set).
- **Never start, stop, reset or reconfigure the user's `floci` container**, and never touch Floci resources that are not lab-owned (e.g. the existing `smoke` SQS queue).
- **No fake functionality.** No decorative buttons, no "mastered" without a real assessment, no claiming a Floci operation works without having run it.
- **No paid APIs.** The AI instructor must work with no key (built-in content) and optionally a free local model (Ollama).
- Cache Components is on: anything reading cookies/DB/time renders inside `<Suspense>`; the DAL (`src/lib/auth/dal.ts`) is the only place that authorises a request.
- Tests use `TEST_DATABASE_URL` only and wipe it; never point tests at the app database.
- Build in phases; each phase ends with tests passing and a report in `docs/reports/`.
