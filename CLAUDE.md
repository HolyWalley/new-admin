# NewAdmin

A modern drop-in replacement for rails_admin using React + shadcn/ui + Inertia.js.

## Project structure

- `docs/ARCHITECTURE.md` — full architecture overview, stack, asset strategy
- `docs/phases/` — detailed specs for each development phase (read the relevant phase before starting work)
- `spec/dummy/` — test Rails app with rails_admin at `/admin` (Rails 8.1, Ruby 4.0.1)
- `e2e/` — Playwright E2E tests (45 tests against rails_admin, will be adapted for new admin)
- `lib/` + `app/` — the gem engine code
- `frontend/` — React + Vite + shadcn/ui (once Phase 1 is done)

## Before starting work

1. Read `docs/ARCHITECTURE.md` for overall context
2. Check `docs/phases/` to find the current phase (look for `Status: IN PROGRESS` or the first `NOT STARTED`)
3. The phase doc has tasks, files to create/modify, and verification criteria

## Running the dummy app

```bash
cd spec/dummy
bin/rails db:setup   # first time only
bin/rails server
# rails_admin at http://localhost:3000/admin
# Login: admin@example.com / password
```

## Running E2E tests

```bash
cd spec/dummy && bin/rails server  # in one terminal
cd e2e && npm test                  # in another
```

## Key decisions

- Inertia.js bridges Rails controllers → React pages (no separate API)
- Prebuilt assets by default (no Node.js for users), Vite scaffold for custom components
- E2E tests are the spec — we build until they pass against the new admin
