# Development guide

## Layout

```
src/
  app/              Next.js routes (page.tsx = home, login/, actions/)
  db/               schema.ts (tables), client.ts (factory), index.ts (app singleton)
  lib/auth/         password, sessions, login/lockout, dal (request → user)
  lib/floci/        endpoint guard, health check
  lib/env.ts        validated server configuration
  proxy.ts          optimistic auth redirect
content/lessons/    lesson content: one folder per lesson (see below)
drizzle/            generated SQL migrations (commit these)
scripts/            setup-env, migrate, create-user, db.sh
tests/unit/         pure logic
tests/integration/  against the academy_test database
docs/               architecture, this guide, phase reports
```

## Changing the database

1. Edit `src/db/schema.ts`.
2. Run `npm run db:generate -- --name <what-changed>`, then review the new SQL in `drizzle/`.
3. Run `npm run db:migrate`. Tests migrate the test DB automatically.

## Writing a lesson

1. Add (or find) the lesson's slug and title in `src/content/curriculum.ts`.
2. Create `content/lessons/<slug>/` with:
   - `lesson.yaml`: title (must match the curriculum), summary, minutes, prerequisites, topics, `labTier`, `verifiedOn`, certifications, plus `sections.terms`, `sections.interview` and `sections.check`
   - one Markdown file per prose section: `what.md why.md how.md architecture.md real-world.md demo.md cli.md troubleshooting.md security.md certification.md assignment.md`
3. **Run every Floci command yourself** with `--endpoint-url http://localhost:4566`, paste the real output, and set `verifiedOn`. Note anywhere Floci behaves differently from real AWS.
4. Use `~~~` code fences and ASCII-only arrows (`^ v < >`) in diagrams; wide glyphs like ▲ break alignment.
5. Run `npm test`. The schema rejects missing sections, placeholder text, thin sections and commands without the local endpoint.

## Testing

- `npm test` runs every test. The global setup migrates `academy_test` and refuses to run if it equals `DATABASE_URL`.
- Integration tests **truncate the test database**. Your learning data lives in `academy` and is never touched.
- `FLOCI_LIVE=1 npm test` adds a live check against Floci.
- `npm run build && npm run test:e2e` runs the browser tests against the production build on port 3100. They reset the TEST DB and seed a temporary `e2e` user.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm run db:up` says `.env not found` | First run | `npm run setup:env` |
| `connect ECONNREFUSED 127.0.0.1:5433` | Postgres not running | `npm run db:up`. If Colima is stopped: `colima start` |
| Status panel: Floci "Cannot connect" | Floci container stopped (it has no restart policy) | `docker start floci` |
| `Invalid server configuration … FLOCI_ENDPOINT` | Endpoint is not loopback http | Set `FLOCI_ENDPOINT=http://localhost:4566` in `.env` |
| "Too many failed attempts" | 5 wrong passwords in 15 min | Wait 15 minutes, or `npm run user:reset-password` |
| `docker compose` not found | Colima installs no compose plugin | Not needed: `scripts/db.sh` uses plain `docker` |

## Resetting your own data

This permanently deletes your learning history:

```bash
npm run db:down
docker rm ama-postgres && docker volume rm ama_pgdata
npm run db:up && npm run db:migrate && npm run user:create
```
