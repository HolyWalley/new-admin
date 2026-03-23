# NewAdmin

A modern drop-in replacement for rails_admin using React + shadcn/ui + Inertia.js.

## Project structure

- `docs/ARCHITECTURE.md` — full architecture overview, stack, asset strategy
- `spec/dummy/` — test Rails app with rails_admin at `/admin` (Rails 8.1, Ruby 4.0.1)
- `e2e/` — Playwright E2E tests (45 tests against rails_admin, will be adapted for new admin)
- `lib/` + `app/` — the gem engine code
- `frontend/` — React + Vite + shadcn/ui

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
