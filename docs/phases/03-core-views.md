# Phase 3 — Core Views

## Goal

Build the main CRUD views: dashboard, list, show, new, edit. Support basic field types.

## Status: COMPLETE

## Depends on: Phase 2

## End state

- Dashboard: model grid with counts, links to each model
- List: sortable table with pagination, column display
- Show: field-value pairs, association links
- New/Edit: auto-generated forms for basic field types
- Create/Update/Delete operations work

## Views to build

### Dashboard (`/new-admin`)
- Grid of model cards showing name + record count
- Click → navigate to list view
- Navigation sidebar with all models

### List (`/new-admin/:model`)
- DataTable (shadcn) with server-side pagination and sorting
- Columns auto-detected from model introspection
- Row actions: show, edit, delete
- Bulk selection checkboxes
- "Add new" button

### Show (`/new-admin/:model/:id`)
- Field-value display for all columns
- Association links (belongs_to → link, has_many → count/list)
- Edit/Delete buttons

### New/Edit (`/new-admin/:model/new`, `/new-admin/:model/:id/edit`)
- Auto-generated form based on column types
- Field type mapping:
  - string → Input
  - text → Textarea
  - integer/decimal → Input[type=number]
  - boolean → Switch or RadioGroup
  - datetime → DatePicker
  - enum → Select
- Server-side validation, errors displayed inline
- Save → redirect to list with flash

### Delete (`/new-admin/:model/:id/delete`)
- Confirmation page or dialog
- Delete → redirect to list with flash

## Controllers

### `NewAdmin::ResourceController`
Generic CRUD controller for any model:
- `index` → list with pagination/sorting params
- `show` → single record
- `new` / `create`
- `edit` / `update`
- `destroy`
- Uses model introspection to determine permitted params

## React pages

- `pages/Dashboard/Index.tsx`
- `pages/Resource/Index.tsx` (list)
- `pages/Resource/Show.tsx`
- `pages/Resource/New.tsx`
- `pages/Resource/Edit.tsx`

## React components

- `components/DataTable.tsx` (shadcn DataTable)
- `components/ResourceForm.tsx` (auto-generated form)
- `components/fields/StringField.tsx`
- `components/fields/TextField.tsx`
- `components/fields/NumberField.tsx`
- `components/fields/BooleanField.tsx`
- `components/fields/DateTimeField.tsx`
- `components/fields/EnumField.tsx`

## Verification

- E2E tests for dashboard, list, crud, forms, navigation adapted to `/new-admin`
- Side-by-side comparison with rails_admin at `/admin`
