# NewAdmin — Architecture

## What is this?

A modern drop-in replacement for rails_admin using React + shadcn/ui + Inertia.js.

## Project structure

```
new-admin/
├── app/                      # Rails engine (controllers, models, views)
├── config/routes.rb          # Engine routes
├── lib/
│   ├── new_admin.rb
│   └── new_admin/
│       ├── engine.rb
│       └── version.rb
├── frontend/                 # React + Vite + shadcn/ui (TODO)
├── spec/dummy/               # Test Rails app with rails_admin + models + seeds
├── e2e/                      # Playwright E2E tests (45 tests, all passing)
├── docs/                     # Phase specs and plans
├── new_admin.gemspec
└── Gemfile
```

## Stack

- Ruby 4.0.1, Rails 8.1.2
- Inertia.js (Rails adapter + React)
- React + TypeScript + Vite
- shadcn/ui (Tailwind-based components)
- SQLite (test app)

## Asset strategy

Two modes:
1. **Default (zero-config)**: Prebuilt JS/CSS bundled in the gem, served via Propshaft. No Node.js needed.
2. **Extensible**: User runs a generator to scaffold Vite + React in their app, imports base components from npm package, registers custom overrides.

## Dummy app (spec/dummy/)

Rails 8.1 app with rails_admin mounted at `/admin`. Contains 13 models covering all key scenarios:
- User (Devise, enum role, ActiveStorage avatar)
- Category (self-referential parent/children)
- Post (belongs_to user/category, has_many comments via polymorphic, has_many tags through taggings, ActionText body, ActiveStorage cover_image, enum status)
- Comment (polymorphic commentable, enum status)
- Tag + Tagging (many-to-many through)
- Product / DigitalProduct / PhysicalProduct (STI)
- Order (has_many order_items, has_one address, nested attributes, enum status)
- OrderItem, Address
- Page (ActionText content, slug)

Seeds: 5 users, 12 categories, 30 posts, 15 tags, 10 products, 20 orders, 5 pages.
Login: admin@example.com / password

## E2E tests (e2e/)

45 Playwright tests across 10 suites: dashboard, list, crud, associations, forms, file-upload, nested-forms, sti, bulk-actions, navigation. Currently test rails_admin at `/admin`. Will be adapted to test new_admin at `/new-admin`.

## Development phases

See docs/phases/ for detailed specs per phase.

## Key decisions

- Inertia.js over REST API: no separate API layer, Rails controllers serve Inertia responses, auth/sessions stay server-side
- shadcn/ui over pre-built component library: user owns the code, fully customizable
- Gem ships prebuilt assets by default, extensible via Vite scaffold for custom components
