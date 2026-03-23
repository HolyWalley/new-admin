# Phase 5 — Configuration DSL & Extensibility

## Goal

Allow users to customize the admin panel via Ruby DSL and extend it with custom React components.

## Status: NOT STARTED

## Depends on: Phase 4

## End state

Users can configure field visibility, labels, ordering, and register custom React components for fields, actions, and pages.

## Ruby DSL

```ruby
NewAdmin.config do |config|
  config.authenticate_with { warden.authenticate! scope: :user }
  config.current_user_method(&:current_user)

  config.model "Order" do
    list do
      field :number
      field :status
      field :total
      field :user
      field :created_at
    end

    edit do
      field :number
      field :status, :custom_component => "OrderStatusSelect"
      field :notes
      field :order_items
      field :address
      exclude :total  # computed field
    end
  end
end
```

## Custom React components

```tsx
// User's app: app/javascript/new_admin/extensions.ts
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

## Generator for extensibility

`rails g new_admin:vite` scaffolds:
- Vite config in host app
- Entry point that imports base new_admin components
- tsconfig, tailwind config
- Example custom component

## Features

- Field visibility (include/exclude per view)
- Field ordering
- Field labels and help text
- Custom field components (per-type or per-field)
- Custom member/collection actions
- Custom pages under `/new-admin/*`
- Navigation groups and ordering
- Authorization adapter (Pundit, CanCanCan)
- Audit trail adapter

## Verification

- Configure dummy app with custom DSL, verify it renders correctly
- Register a custom field component, verify it appears in forms
