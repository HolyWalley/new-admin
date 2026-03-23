# Phase 4 — Advanced Fields & Associations

## Goal

Handle all the complex field types and association patterns that make an admin panel actually useful.

## Status: IN PROGRESS (4a complete — associations, STI, bulk actions)

## Depends on: Phase 3

## End state

All 13 dummy app models are fully editable through the new admin with correct field rendering.

## Sub-phases

### 4a — Association Fields + STI + Bulk Actions (COMPLETE)

**Association fields:**
- belongs_to → Select with blank option (always shows "— Select —")
- has_many :through → MultiSelectField (`<select multiple>` for Tag assignment on Posts)
- polymorphic → PolymorphicField (type selector + id selector, e.g., Comment.commentable)
- self-referential → SelectField with `excludeId` to filter out current record (Category.parent)

**STI:**
- Base model (Product) list shows type column with DigitalProduct/PhysicalProduct values
- Sub-type lists filter correctly (`/new-admin/digital_product`, `/new-admin/physical_product`)
- Sub-type forms show type-specific fields (`download_url`, `weight_kg`)

**Bulk actions:**
- Row checkboxes (`input[name="bulk_ids[]"]`) + select-all toggle (`input.toggle`)
- Sticky bulk action bar with delete button (`.bulk-link[data-action="bulk_delete"]`)
- `DELETE /new-admin/:model_name/bulk_destroy` endpoint

**Other:**
- `htmlId` prop on all field components for testable IDs (`#post_user_id`, `#digital_product_download_url`)
- DataTable: has_many count columns (`th.posts_field`), `table.table` class
- E2E tests adapted: associations.spec.ts, sti.spec.ts, bulk-actions.spec.ts

**E2E tests:** associations (6), sti (5), bulk-actions (3) — 14 tests

### 4b — ActiveStorage + ActionText + Nested Forms (NOT STARTED)

**File uploads (ActiveStorage):**
- has_one_attached → file input with preview (image) or filename (other)
- Existing attachment shown with remove option
- Upload via standard form submission
- Models: User.avatar, Post.cover_image

**Rich text (ActionText):**
- has_rich_text → Trix editor or similar rich text component
- Display as rendered HTML on show page
- Models: Post.body, Page.content

**Nested forms:**
- accepts_nested_attributes_for → inline sub-forms
- Add/remove nested records dynamically
- Order → OrderItems (has_many, allow_destroy) + Address (has_one, allow_destroy)

**E2E tests:** file-upload (2), nested-forms (2) — 4 tests

### 4c — Search & Filtering (NOT STARTED)

**Search & filtering:**
- Global search across configured fields
- Per-column filters (text contains, enum equals, date range, boolean)
- Filter UI in list view header

**E2E tests:** none explicit (but improves usability)

## Verification

- E2E tests for associations, file-upload, nested-forms, sti, bulk-actions adapted to `/new-admin`
- All 45 E2E tests passing against new admin
