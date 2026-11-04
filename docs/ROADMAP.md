# Roadmap

The academy is built in 11 phases. Each phase ends with tests passing and a report in [reports](reports).

| Phase | Scope | Done when | Status |
|---|---|---|---|
| 1 | Environment inspection and plan | Plan approved | Done |
| 2 | Foundation: Next.js app, PostgreSQL + Drizzle, single-user auth, Floci endpoint guard | Tests pass | Done |
| 3 | Dashboard, curriculum navigation, lesson viewer, notes and bookmarks, lesson 1 | Browser tests pass | Done |
| 4 | Level 1 and Level 2 lessons, written in batches | Every lesson passes the 14-section check | In progress |
| 5 | Service lessons (Level 3): S3, DynamoDB, Lambda, SQS/SNS first | Same check, plus each lesson maps to exam domains | Planned |
| 6 | Floci lab: connection status, runner, output display, reset, tier labels | Safety tests pass, including rejected commands and a forced real-AWS attempt that must fail | Planned |
| 7 | Certification tracks, practice tests, mock exams, analytics | Question bank built against the official exam domains | Planned |
| 8 | AI instructor (built-in content plus optional local Ollama, no paid API) | Personalised replies, hint-first behaviour, no key reaches the browser | Planned |
| 9 | Architecture visualizer (8 architectures) and projects | Interactive flows, failure scenarios, real-time project checks | Planned |
| 10 | Mastery scoring, spaced repetition, re-teaching after a failed assessment | Scoring rules are unit-tested | Planned |
| 11 | Security review, hardening, deployment docs | Audit done, backup and restore tested | Planned |

## Lesson quality bar

Every lesson has all 14 sections, explains each idea simply first and then professionally, and
every CLI command is run against Floci before publishing, with the real output included and
`verifiedOn` set. Any difference between Floci and real AWS is stated in the lesson.

The academy prepares you for AWS certification exams. Certifications themselves are issued only by
AWS, through the official exams. This project is not affiliated with Amazon Web Services.
