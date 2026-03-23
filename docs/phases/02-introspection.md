# Phase 2 — Model Introspection

## Goal

Build the layer that reads ActiveRecord models and exposes their structure (columns, types, associations, validations, enums) as data the frontend can consume.

## Status: NOT STARTED

## Depends on: Phase 1

## End state

- `NewAdmin::Introspector.models` returns a list of all app models with their metadata
- Dashboard page shows real model names and record counts (not hardcoded)
- Metadata is serialized as JSON props via Inertia to the React frontend

## Key classes to build

### `NewAdmin::Introspector`
Discovers all ActiveRecord models in the host app.

### `NewAdmin::ModelConfig`
Holds metadata for a single model:
- `name`, `table_name`, `primary_key`
- `columns` → array of `ColumnConfig`
- `associations` → array of `AssociationConfig`
- `validations` → array of validation info
- `enums` → hash of enum definitions
- `count` → record count
- `to_s_method` → what to use for display name

### `NewAdmin::ColumnConfig`
- `name`, `type` (string, text, integer, decimal, boolean, date, datetime, enum, etc.)
- `nullable`, `default`, `limit`
- `virtual?` (computed/non-DB fields)
- `rich_text?` (ActionText)
- `attachment?` (ActiveStorage)

### `NewAdmin::AssociationConfig`
- `name`, `type` (belongs_to, has_many, has_one, has_many_through)
- `target_model`, `foreign_key`
- `polymorphic?`, `through?`
- `nested_attributes?` (accepts_nested_attributes_for)

## Scenarios to handle

From our dummy app models:
- Basic column types: string, text, integer, decimal, boolean, datetime
- Enums: User.role, Post.status, Comment.status, Order.status
- belongs_to: Post→User, Post→Category, Comment→User
- belongs_to optional: Post→Category, Category→Parent
- has_many: User→Posts, Category→Posts, Order→OrderItems
- has_many through: Post→Tags (through Taggings)
- has_one: Order→Address
- Polymorphic: Comment→commentable
- Self-referential: Category→parent/children
- STI: Product / DigitalProduct / PhysicalProduct
- ActiveStorage: User.avatar, Post.cover_image
- ActionText: Post.body, Page.content
- Nested attributes: Order→order_items, Order→address

## Verification

- Dashboard at `/new-admin` shows real model list with counts
- Model data matches what rails_admin shows at `/admin`
