# AWS Mastery Academy

A personal AWS learning, practical lab and certification platform.
It runs entirely on your Mac and practises against your local **Floci** emulator
(`http://localhost:4566`), never against real AWS.

> **Status:** Phase 3 of 11 complete: dashboard, curriculum navigation, the lesson viewer, notes and bookmarks.
> Lesson 1 (*What is cloud computing?*) is fully written; the rest of the curriculum is mapped and shown as "Planned".
> See [docs/reports](docs/reports) for per-phase implementation reports.

## Requirements

| Tool | Version | Notes |
|---|---|---|
| macOS (Apple silicon) | — | Built and tested on macOS 27 / M4 |
| Node.js | ≥ 24 | |
| Docker | via Colima | Only PostgreSQL runs in Docker. No compose plugin needed. |
| Floci | 2.4.x | Your existing container. This project never starts, stops or changes it. |

No paid services and no API keys are needed.

## First-time setup

```bash
cd ~/AWS-Learning/academy
npm install
npm run setup:env       # creates .env with a random DB password (never overwrites)
npm run db:up           # starts PostgreSQL on 127.0.0.1:5433
npm run db:migrate      # creates the tables
npm run user:create     # creates YOUR account (prompts for username + password)
npm run dev             # http://127.0.0.1:3000
```

## Everyday use

```bash
npm run db:up    # if Postgres is not already running (it restarts with Docker automatically)
npm run dev
```

Open <http://127.0.0.1:3000> and sign in.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server, bound to 127.0.0.1 only |
| `npm run build` / `npm start` | Production build / server (127.0.0.1 only) |
| `npm test` | Unit + integration tests (uses the separate `academy_test` DB) |
| `FLOCI_LIVE=1 npm test` | Also checks the live Floci endpoint |
| `npm run build && npm run test:e2e` | Browser tests (Playwright, test DB, port 3100) |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run db:up` / `db:down` / `db:status` / `db:psql` | Manage the Postgres container |
| `npm run db:generate` | Create a new SQL migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (`-- --test` for the test DB) |
| `npm run user:create` / `user:reset-password` | Manage your account |

## Documentation

- [Architecture](docs/ARCHITECTURE.md): components, data model, safety design
- [Development guide](docs/DEVELOPMENT.md): workflow, testing, troubleshooting
- [Phase reports](docs/reports)
