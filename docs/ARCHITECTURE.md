# Architecture

## Overview

```
Browser ──HTTP (127.0.0.1 only)──► Next.js 16 app (runs natively on macOS)
                                    │
                                    ├─ proxy.ts ............ optimistic "has a session cookie?" redirect
                                    ├─ Server Components ... render pages; read data via the DAL
                                    ├─ Server Actions ...... login / logout (CSRF-checked by Next.js)
                                    ├─ DAL (lib/auth/dal) .. the ONLY place a request becomes a user
                                    │
                                    ├──► PostgreSQL 16 (Docker, 127.0.0.1:5433, container ama-postgres)
                                    └──► Floci (your container, localhost:4566), guarded by assertLocalEndpoint
```

The browser never receives database credentials, AWS credentials or any API key.
No environment variable uses the `NEXT_PUBLIC_` prefix.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Cache Components) + React 19 + TypeScript | One codebase for UI and secure server logic |
| Styling | Tailwind CSS 4 | Fast, consistent UI |
| Database | PostgreSQL 16 + Drizzle ORM (postgres.js driver) | Typed schema, plain SQL migrations committed to git |
| Auth | Own implementation: bcrypt + DB-backed sessions | Single local user; no third-party service |
| Validation | Zod | Config and form input |
| Tests | Vitest (unit + integration against a separate test DB) | |

## Authentication design

- **One account**, created from the terminal (`npm run user:create`). There is no sign-up page.
- Passwords: bcrypt, cost 12, 10–72 bytes.
- Session: 32 random bytes in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production).
  The database stores only the **SHA-256 hash** of the token, so a database leak cannot be replayed as a login.
- Unknown usernames are checked against a real dummy bcrypt hash, so response time does not reveal which usernames exist.
- **Lockout:** 5 failed attempts within 15 minutes blocks login for that username (even with the right password) until the window passes. A successful login resets the count.
- Logout deletes the session row. Password reset deletes all sessions.
- Server Actions reject cross-origin requests (Next.js Origin/Host check), which is verified in the Phase 2 report.

## Floci safety design

`assertLocalEndpoint` accepts only `http://localhost|127.0.0.1|[::1]:<port>` with no credentials, path or query.
It runs when configuration loads (startup fails on a non-local `FLOCI_ENDPOINT`) and again before every Floci request.

Planned for the Phase 6 lab runner, all behind this guard:
- Run the AWS CLI with an argv array (no shell, so no `;`, `|` or `$( )` injection).
- An allowlist of approved services and operations per lab.
- A forced `--endpoint-url` and dummy credentials. Refuse to run if real-AWS credentials or profiles are present.
- Lab resources named `ama-<lab>-…` and tagged; "reset" deletes only resources with both.
- Destructive operations need explicit confirmation in the UI.
- Every run logged to `lab_runs`.

## Data model (Phase 2)

| Table | Purpose |
|---|---|
| `users` | The learner account |
| `sessions` | Hashed session tokens with expiry |
| `login_attempts` | Throttling and an audit trail |
| `learner_profiles` | Level, certification goal, exact resume point |
| `lesson_progress` | Per-lesson status; `mastered` is set only by the assessment engine |
| `assessment_attempts` | Quiz, free-response, lab-check, practice and mock exams, with topic tags for weak-topic analysis |
| `lab_runs` | Exact argv, endpoint, exit code and output of every lab command |
| `notes`, `bookmarks` | Personal tools |
| `activity_days` | Learning streak |

## AI instructor (Phase 8): no paid API

There is a provider interface with two implementations:
1. **Built-in (default, free, offline):** explanations at several depths, hint ladders, misconception feedback and re-teach variants, all written into each lesson's content. Grading uses rubrics and keywords.
2. **Ollama (optional, free):** a local open model on the Mac for free-form questions. It is only enabled if the user installs Ollama.

Either way, the platform works fully without any API key.
