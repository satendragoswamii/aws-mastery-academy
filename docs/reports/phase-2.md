# Phase 2 report: foundation and database

**Date:** 2026-11-04  **Status:** complete, awaiting approval for Phase 3

## Delivered

- Next.js 16.4.5 + React 19 + TypeScript + Tailwind 4 app in `~/AWS-Learning/academy` (git repo).
- PostgreSQL 16 in Docker (`ama-postgres`, loopback-only port 5433, 256 MB limit, named volume `ama_pgdata`), plus a separate `academy_test` DB.
- Drizzle schema with 10 tables and the initial migration `drizzle/0000_init.sql`.
- Single-user sign-in: bcrypt, hashed DB sessions, lockout, logout, CLI account creation and password reset.
- Validated server config; Floci endpoint guard; live Floci health check.
- Home page with real data only: who is signed in, learner profile, Postgres and Floci status.
- Docs: README, ARCHITECTURE, DEVELOPMENT.

## Verification

| Check | Result |
|---|---|
| `npm test` (unit + integration, plus live Floci) | **40/40 passed** |
| `npm run typecheck`, `npm run lint`, `npm run build` | pass |
| E2E over HTTP, against the test DB with a temporary user: | |
| unauthenticated `/` | 307 → `/login` |
| forged session cookie | user content not rendered |
| wrong password | "Incorrect username or password" |
| correct password | 303 → `/`, httpOnly cookie, page shows user and **Floci 2.4.0 · 129 services** |
| logout, then reuse the old cookie | 307 → `/login` |
| cross-origin login POST (CSRF) | rejected by Next.js, no session created |
| 5 wrong passwords, then the correct one | locked out |
| `X-Powered-By` header | removed |

## Deviations from plan

- **No `compose.yaml`.** Colima has no compose plugin, and installing one would mean editing `~/.docker/config.json`. `scripts/db.sh` does the same with plain `docker`.
- **`postgres` driver pinned to 3.x.** 4.0.0 is brand new, and Drizzle is tested against 3.x.
- **AI instructor:** no paid API key, by design. Phase 8 will use built-in content plus optional free local Ollama.

## Known limitations

- Two moderate `npm audit` advisories remain in **dev-only** tooling (drizzle-kit's bundled esbuild, eslint's minimatch). They don't ship and don't apply to how these tools are used. Production dependencies report 0 vulnerabilities.
- Browser-based (Playwright) E2E tests are deferred to Phase 3 to keep the dev machine's disk usage down. The HTTP-level E2E above ran manually.

## Untouched (as required)

The Floci and floci-aws-ui containers, Floci data, the `smoke` queue, `~/.aws/*`, Colima settings and `~/.docker/config.json`.
