# Phase 4 — Advanced Fields & Associations

## Goal

Handle all the complex field types and association patterns that make an admin panel actually useful.

## Status: IN PROGRESS (4a, 4b complete)

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

### 4b — ActiveStorage + ActionText + Nested Forms (COMPLETE)

**File uploads (ActiveStorage):**
- has_one_attached → FileUploadField with `<input type="file">` and existing attachment display
- Existing attachment shown with filename and remove option
- Upload via FormData (multipart) with Inertia.js `_method` spoofing for PATCH
- Models: User.avatar, Post.cover_image

**Rich text (ActionText):**
- has_rich_text → RichTextField (`<textarea>`) with plain text content
- Backend serializes via `to_plain_text`, permits attribute name directly
- Models: Post.body, Page.content

**Nested forms:**
- accepts_nested_attributes_for → NestedFormSection component
- has_many (Order → OrderItems): list of sub-forms with Add/Remove, indexed `_attributes` hash
- has_one (Order → Address): single sub-form with remove option
- Dynamic add/remove with `_destroy` flag for Rails nested attributes
- Association options loaded for nested foreign keys (e.g., OrderItem.product_id)
- CSS classes: `.order_items_field`, `.address_field`; IDs: `[id*="order_item"]`, `[id*="address"]`

**Backend:**
- `permitted_params` extended for attachments, rich text, and nested attributes
- `nested_form_config` method: builds column metadata + association options for nested models
- `nested_form_data_for(record)` method: serializes existing nested records
- Props passed to New/Edit: `nested_form_config`, `nested_form_data`

**Frontend:**
- New components: FileUploadField, RichTextField, NestedFormSection
- ResourceForm: detects `attachment_attributes`, `rich_text_attributes`, `nestedFormConfig`
- FormData builder for file uploads with nested attribute flattening
- E2E tests adapted: file-upload.spec.ts, nested-forms.spec.ts

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
