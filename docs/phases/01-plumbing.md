# Phase 1 — Plumbing

## Goal

Get Inertia.js + React + shadcn/ui rendering inside the Rails engine. Prove the full stack works end-to-end with one hardcoded page.

## Status: COMPLETE

## End state

- Visit `/new-admin` in the dummy app → see a React page rendered via Inertia
- Page has a basic layout: sidebar with model list, header with app name
- All served from prebuilt assets bundled in the engine (no Node.js required by host app)

## Tasks

### 1. Frontend build setup

- [ ] Create `frontend/` directory with Vite + React + TypeScript
- [ ] Install shadcn/ui + Tailwind CSS 4
- [ ] Configure Vite to output to `app/assets/builds/new_admin/` (or similar path the engine can serve)
- [ ] Add build script to package.json

### 2. Engine plumbing

- [ ] Add `inertia_rails` gem dependency to gemspec
- [ ] Configure engine to serve the built frontend assets
- [ ] Create `NewAdmin::ApplicationController` as base controller
- [ ] Create `NewAdmin::DashboardController#index` that renders an Inertia response
- [ ] Set up engine routes: `root to: 'dashboard#index'`

### 3. Inertia integration

- [ ] Configure Inertia in the engine (shared data, layout)
- [ ] The engine's layout should load the React app (JS + CSS entry points)
- [ ] React app should have an Inertia root that renders pages based on Inertia responses

### 4. Basic layout component

- [ ] Create React `Layout` component with:
  - Sidebar (hardcoded model list for now)
  - Header (app name, user info placeholder)
  - Main content area
- [ ] Create React `Dashboard` page component (placeholder content)
- [ ] Use shadcn/ui components: `Sidebar`, `Button`, etc.

### 5. Mount in dummy app

- [ ] Add `new_admin` engine to dummy app's Gemfile (path reference)
- [ ] Mount at `/new-admin` in dummy routes (alongside rails_admin at `/admin`)
- [ ] Verify: start server, visit `/new-admin`, see the React dashboard

## Key decisions to make during implementation

1. **How does the engine serve Vite output?** Options:
   - Propshaft serves from engine's `app/assets/builds/`
   - Engine has its own static file middleware
   - Importmap for JS (probably not — we want full React/JSX)

2. **Inertia SSR?** No, skip SSR for now. Client-side rendering only.

3. **How does Inertia find React page components?** Convention: `NewAdmin::DashboardController#index` renders Inertia page `Dashboard/Index`, which maps to `frontend/pages/Dashboard/Index.tsx`.

## Files to create/modify

### New files (engine)
- `app/controllers/new_admin/application_controller.rb`
- `app/controllers/new_admin/dashboard_controller.rb`
- `app/views/layouts/new_admin/application.html.erb` (Inertia root layout)
- `config/routes.rb` (engine routes)

### New files (frontend)
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.ts`
- `frontend/src/main.tsx` (Inertia app entry)
- `frontend/src/layouts/Layout.tsx`
- `frontend/src/pages/Dashboard/Index.tsx`
- `frontend/src/components/ui/` (shadcn components)

### Modified files
- `new_admin.gemspec` (add inertia_rails dependency)
- `lib/new_admin/engine.rb` (asset configuration)
- `spec/dummy/Gemfile` (add path reference to new_admin)
- `spec/dummy/config/routes.rb` (mount new_admin engine)

## Verification

- `cd spec/dummy && bin/rails server`
- Visit `http://localhost:3000/new-admin` → see React dashboard with sidebar
- Visit `http://localhost:3000/admin` → rails_admin still works
- No Node.js required by the dummy app (assets are prebuilt)
