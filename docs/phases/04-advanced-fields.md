# Phase 4 — Advanced Fields & Associations

## Goal

Handle all the complex field types and association patterns that make an admin panel actually useful.

## Status: NOT STARTED

## Depends on: Phase 3

## End state

All 13 dummy app models are fully editable through the new admin with correct field rendering.

## Features

### Association fields
- belongs_to → searchable Select (with async search for large datasets)
- belongs_to optional → Select with blank option
- has_many → multi-select or inline table
- has_many :through → multi-select (Tag assignment on Posts)
- has_one → inline form or link
- polymorphic → type selector + id selector
- self-referential → Select filtered to exclude self (Category parent)

### File uploads (ActiveStorage)
- has_one_attached → file input with preview (image) or filename (other)
- Existing attachment shown with remove option
- Upload via standard form submission

### Rich text (ActionText)
- has_rich_text → Trix editor or similar rich text component
- Display as rendered HTML on show page

### Nested forms
- accepts_nested_attributes_for → inline sub-forms
- Add/remove nested records dynamically
- Order → OrderItems (has_many) + Address (has_one)

### STI
- Base model list shows type column
- Sub-type lists filter correctly
- New form for sub-type pre-fills type
- Sub-type-specific fields shown/hidden based on type

### Bulk actions
- Select all / select individual
- Bulk delete with confirmation
- Extensible for custom bulk actions later

### Search & filtering
- Global search across configured fields
- Per-column filters (text contains, enum equals, date range, boolean)
- Filter UI in list view header

## Verification

- E2E tests for associations, file-upload, nested-forms, sti, bulk-actions adapted to `/new-admin`
- All 45 E2E tests passing against new admin
