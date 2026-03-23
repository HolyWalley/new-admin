# Phase 5 — Configuration DSL & Extensibility

## Goal

Allow users to customize the admin panel via Ruby DSL and extend it with custom React components.

## Status: IN PROGRESS

## Depends on: Phase 4

## End state

Users can configure field visibility, labels, ordering, and register custom React components for fields, actions, and pages. Authentication and authorization are pluggable. Navigation is customizable.

## Sub-phases

### 5a — Ruby DSL & Field Configuration (DONE)

The foundation that all other sub-phases build on.

**DSL infrastructure:**
- `NewAdmin.config do |config| ... end` global configuration block
- `NewAdmin::Configuration` class to hold all settings
- `config.model "Order" do ... end` per-model configuration blocks
- `NewAdmin::ModelConfiguration` class per model (distinct from introspection `ModelConfig`)

**View-specific field config:**
- `list do ... end` block — controls which fields appear in the list view and their order
- `edit do ... end` block — controls which fields appear in new/edit forms and their order
- `show do ... end` block — controls which fields appear on the show page
- If no DSL config for a model, fall back to introspected defaults (current behavior)

**Field options:**
- `field :name` — include field, use introspected defaults
- `field :name, label: "Full Name"` — custom label
- `field :name, help: "Enter first and last name"` — help text below field
- `exclude :total` — hide a field from the view
- Field ordering determined by declaration order in the DSL block

**Backend integration:**
- `NewAdmin::Introspector` merges DSL config with introspected metadata
- Controller reads merged config to determine visible columns per view
- `model_metadata` includes DSL-provided labels and help text
- Frontend receives `label` and `help` on `ColumnDef` and renders them

**Example:**
```ruby
# config/initializers/new_admin.rb
NewAdmin.config do |config|
  config.model "Order" do
    list do
      field :number
      field :status
      field :total
      field :user
      field :created_at
    end

    edit do
      field :number, label: "Order Number", help: "Auto-generated if blank"
      field :status
      field :notes
      field :order_items
      field :address
      exclude :total  # computed field
    end
  end
end
```

**Files to create:**
- `lib/new_admin/configuration.rb` — global config class
- `lib/new_admin/model_configuration.rb` — per-model DSL config
- `lib/new_admin/view_configuration.rb` — per-view (list/edit/show) field config
- `config/initializers/new_admin.rb` in dummy app — example DSL usage

**Files to modify:**
- `lib/new_admin.rb` — add `config` class method
- `app/controllers/new_admin/resources_controller.rb` — read DSL config for field visibility/ordering
- `frontend/src/types/index.ts` — add `label`, `help` to `ColumnDef`
- `frontend/src/components/fields/FieldWrapper.tsx` — render help text
- `frontend/src/components/DataTable.tsx` — use label for column headers

**Verification:**
- Configure Order model in dummy app DSL
- `/new-admin/order` list shows only configured fields in configured order
- `/new-admin/order/1/edit` shows only configured fields with custom labels and help text
- `/new-admin/post` (no DSL config) continues to work with introspected defaults
- All E2E tests pass

---

### 5b — Authentication & Authorization (NOT STARTED)

Critical for real-world deployment. Depends on 5a DSL infrastructure.

**Authentication:**
- `config.authenticate_with { warden.authenticate! scope: :user }` — block called in `before_action`
- `config.current_user_method(&:current_user)` — method to resolve current user
- If not configured, admin is open (development default)

**Authorization adapter:**
- `config.authorize_with :pundit` or `config.authorize_with :cancancan`
- Adapter interface: `can?(action, model_class)` and `can?(action, record)`
- Actions: `:list`, `:show`, `:create`, `:update`, `:destroy`
- Models hidden from sidebar if user cannot `:list`
- Actions hidden from UI if user cannot perform them
- 403 response if user bypasses UI

**Example:**
```ruby
NewAdmin.config do |config|
  config.authenticate_with { warden.authenticate! scope: :user }
  config.current_user_method(&:current_user)
  config.authorize_with :pundit
end
```

**Files to create:**
- `lib/new_admin/authorization/base.rb` — adapter interface
- `lib/new_admin/authorization/pundit_adapter.rb`
- `lib/new_admin/authorization/cancancan_adapter.rb`

**Files to modify:**
- `lib/new_admin/configuration.rb` — auth settings
- `app/controllers/new_admin/application_controller.rb` — authentication before_action
- `app/controllers/new_admin/resources_controller.rb` — authorization checks
- Frontend sidebar — hide unauthorized models

**Verification:**
- Configure authentication in dummy app
- Unauthenticated access redirects to login
- Authorization hides models/actions the user cannot access

---

### 5c — Custom Components & Extensibility (NOT STARTED)

The "bring your own React" layer. Depends on 5a.

**Component registry:**
- `registerField(name, component)` — custom field renderer
- `registerAction(name, { label, icon, component })` — custom member/collection action
- `registerPage(path, component)` — custom page under `/new-admin/*`

**DSL integration:**
- `field :status, custom_component: "OrderStatusSelect"` — use registered component for a field
- Backend passes `custom_component` name in field metadata
- Frontend looks up registered component, falls back to default

**Custom actions:**
- Member actions (per-record): show in row actions dropdown
- Collection actions: show in list view toolbar
- Action components receive record/selection data and can make API calls

**Vite generator:**
- `rails g new_admin:vite` scaffolds host app extensibility
- Creates: Vite config, entry point importing base components, tsconfig, tailwind config
- Example custom component file

**Example:**
```tsx
// app/javascript/new_admin/extensions.ts
import { registerField, registerAction, registerPage } from "@new-admin/react"

registerField("OrderStatusSelect", ({ value, onChange, field }) => (
  <CustomStatusWidget value={value} onChange={onChange} />
))

registerAction("refund", {
  label: "Refund",
  icon: "undo",
  component: RefundDialog,
})

registerPage("/new-admin/analytics", AnalyticsDashboard)
```

**Files to create:**
- `frontend/src/lib/registry.ts` — component registry
- `lib/generators/new_admin/vite/vite_generator.rb` — Vite scaffold generator
- Generator templates

**Files to modify:**
- `frontend/src/components/ResourceForm.tsx` — look up custom field components
- `frontend/src/components/DataTable.tsx` — render custom actions
- `app/controllers/new_admin/resources_controller.rb` — pass custom component metadata
- Routes — catch-all for custom pages

**Verification:**
- Register custom field in dummy app, verify it renders in forms
- Register custom page, verify it loads at custom URL
- Generator creates correct scaffold

---

### 5d — Navigation & Polish (NOT STARTED)

Final UX refinements. Depends on 5a.

**Navigation customization:**
- `config.navigation_groups` — group models under named sections
- `config.model "Order" do; navigation_label "Commerce"; end` — assign model to group
- `config.model "Order" do; weight 10; end` — ordering within groups
- `config.model "InternalThing" do; visible false; end` — hide from nav
- `config.model "Order" do; icon "ShoppingCart"; end` — custom Lucide icon name for sidebar
- Icons are auto-matched by model name semantics; configured icon overrides auto-match
- Unmatched models without configured icon show a colored dot fallback

**Audit trail:**
- `config.audit_with :paper_trail` — adapter for tracking changes
- Show "last modified by" and change history on show page
- Optional — only if adapter configured

**Example:**
```ruby
NewAdmin.config do |config|
  config.navigation do
    group "Content" do
      model "Post"
      model "Page"
      model "Category"
      model "Tag"
    end
    group "Commerce" do
      model "Order"
      model "Product"
    end
    group "Users" do
      model "User"
      model "Comment"
    end
  end
end
```

**Files to modify:**
- `lib/new_admin/configuration.rb` — navigation config
- `app/controllers/new_admin/dashboard_controller.rb` — pass nav groups
- `frontend/src/layouts/Layout.tsx` — render grouped sidebar
- `frontend/src/pages/Dashboard/Index.tsx` — grouped model cards

**Verification:**
- Configure navigation groups in dummy app
- Sidebar shows models grouped under section headings
- Hidden models don't appear in sidebar or dashboard
