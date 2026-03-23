# NewAdmin

A modern, drop-in admin panel for Rails — built with React, shadcn/ui, and Inertia.js.

## Features

- **Zero-API architecture** — Inertia.js bridges Rails controllers and React pages directly
- **Automatic model discovery** — detects all ActiveRecord models, columns, associations, enums, validations, STI, rich text, and attachments
- **Full CRUD** — list (with search, filtering, sorting, pagination), show, create, edit, destroy, bulk destroy
- **Smart field types** — booleans, dates, enums (as badges), belongs_to dropdowns, has_many through multi-selects, rich text (Trix), file uploads (ActiveStorage), polymorphic associations, nested forms
- **Delete cascade preview** — shows what will be affected before destroying a record
- **Ruby DSL** — configure fields per view, navigation groups, icons, visibility, and ordering
- **Custom actions** — server-defined actions with Ruby handlers (zero JS), model scoping, confirm dialogs, member & collection types, display modes (inline/modal/page)
- **Authentication & authorization** — plug in Devise, Pundit, CanCanCan, or a custom block
- **Custom components** — register your own React field editors, action overrides, and full pages
- **Command palette** — Cmd+K to jump to any model or custom page
- **Dark mode** — automatic, based on system preference
- **Prebuilt assets** — no Node.js required for end users; Vite scaffold available for custom components

## Requirements

- Ruby >= 3.4
- Rails >= 8.0
- [inertia_rails](https://github.com/inertiajs/inertia-rails) >= 3.0

## Installation

Add to your Gemfile:

```ruby
gem "new_admin"
```

```bash
bundle install
```

Mount the engine in `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  mount NewAdmin::Engine => "/new-admin", as: "new_admin"
  # ...
end
```

Visit `http://localhost:3000/new-admin` — all your models appear automatically.

## Quick Start

Create `config/initializers/new_admin.rb`:

```ruby
NewAdmin.config do |config|
  # If using Devise:
  config.authenticate_with { warden.authenticate! scope: :user }
  config.current_user_method(&:current_user)
end
```

That's it. NewAdmin discovers your models, columns, associations, and enums automatically.

## Configuration

### Authentication

```ruby
NewAdmin.config do |config|
  # Block runs in controller context — use any auth mechanism
  config.authenticate_with { warden.authenticate! scope: :user }

  # How to resolve the current user (Symbol#to_proc or block)
  config.current_user_method(&:current_user)
  # or:
  config.current_user_method { current_admin }
end
```

If no `current_user_method` is set, NewAdmin falls back to `current_user` if available.

### Authorization

Three built-in adapters, or bring your own:

```ruby
# Pundit — calls YourModelPolicy with standard actions
config.authorize_with :pundit

# CanCanCan — checks Ability class
config.authorize_with :cancancan

# Custom block — receives (user, action, model_class)
config.authorize_with do |user, action, model_class|
  user.admin? || (action == :list)
end
```

Actions checked: `:list`, `:show`, `:create`, `:update`, `:destroy`. Without authorization configured, all actions are allowed.

### Navigation Groups

Organize the sidebar into labeled sections:

```ruby
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
    model "Address"
  end
end
```

Models not assigned to any group appear under "Other". Without a `navigation` block, models auto-group by STI hierarchy and Ruby namespace.

### Per-Model Configuration

```ruby
config.model "Order" do
  navigation_icon "ShoppingCart"  # Lucide icon name (see list below)
  weight 1                        # Lower = higher in sidebar (default: 0)
  visible false                   # Hide from sidebar, dashboard, and command palette
end
```

### Field Configuration

Configure which fields appear in each view and how they render:

```ruby
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
    field :status, custom_component: "OrderStatusSelect"
    field :user
    exclude :total  # computed field, not editable
  end

  show do
    field :number, label: "Order #"
    field :status
    field :total, label: "Order Total"
    field :user, label: "Customer"
    field :created_at
    field :updated_at
  end
end
```

**Field options:**

| Option | Description |
|--------|-------------|
| `label` | Override the column name displayed in headers and form labels |
| `help` | Help text shown below the form input |
| `custom_component` | Name of a registered React component to render this field |

If no fields are declared for a view, all columns are shown (with sensible defaults — e.g., edit excludes `id`, timestamps, and Devise columns). You can also use `exclude` without explicit `field` declarations to remove specific columns from the defaults.

## Custom Components

NewAdmin supports three types of custom React components: **fields**, **actions**, and **pages**. They're registered via a global API and loaded as a separate script bundle.

### Setup

1. Create a Vite config for your custom bundle:

```ts
// vite.config.ts (in your app)
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "app/javascript/new_admin/index.ts",
      formats: ["iife"],
      name: "NewAdminCustom",
      fileName: () => "custom.js",
    },
    outDir: "app/assets/builds/new_admin_custom",
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "window.React",
          "react-dom": "window.ReactDOM",
          "react/jsx-runtime": "window.__jsxRuntime__",
        },
      },
    },
  },
})
```

2. Register the script in your initializer:

```ruby
config.custom_scripts "new_admin_custom/custom"
```

3. Register components in your entry file:

```ts
// app/javascript/new_admin/index.ts
import OrderStatusSelect from "./components/OrderStatusSelect"
import AnalyticsDashboard from "./components/AnalyticsDashboard"

if (window.NewAdmin) {
  window.NewAdmin.registerField("OrderStatusSelect", OrderStatusSelect)
  window.NewAdmin.registerPage("analytics", AnalyticsDashboard, { label: "Analytics" })
}
```

### Custom Fields

Custom fields replace the default input for a specific column. Bind them via the `custom_component` option in the Ruby DSL.

**Props interface:**

```ts
interface CustomFieldProps {
  name: string
  label: string
  value: unknown
  onChange: (value: unknown) => void
  error?: string[]
  required?: boolean
  help?: string
  field: ColumnDef  // column metadata (type, enum_values, nullable, etc.)
}
```

**Example** — colored status pills:

```tsx
export default function OrderStatusSelect({ value, onChange, field, error, help }: CustomFieldProps) {
  const statuses = field.enum_values || []

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              border: value === status ? "2px solid currentColor" : "1px solid var(--border)",
              background: value === status ? "var(--accent)" : "transparent",
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        ))}
      </div>
      {help && <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{help}</p>}
      {error?.map((e) => <p key={e} style={{ color: "var(--destructive)", fontSize: "12px" }}>{e}</p>)}
    </div>
  )
}
```

### Custom Actions

Actions can be defined in Ruby (with zero JS needed) or as pure-frontend React components.

#### Server-Defined Actions (Ruby DSL)

Define actions in your initializer. They get auto-generated UI — no JavaScript needed:

```ruby
NewAdmin.config do |config|
  # Member action — button in each row
  config.action :archive do
    only "Order", "Post"          # model scoping (omit = all models)
    member                         # row-level action (default)
    icon "Archive"                 # Lucide icon name
    label "Archive"
    confirm "Archive this record?" # confirmation dialog before POST

    handler do
      @record.update!(archived: true)
      { success: "#{@record.class.name} archived" }
    end
  end

  # Collection action — button above the table
  config.action :export_csv do
    only "Order"
    collection
    icon "Download"
    label "Export CSV"

    handler do
      csv = @scope.limit(1000).map { |r| [r.id, r.number, r.status].join(",") }.join("\n")
      { download: { data: "id,number,status\n#{csv}", filename: "orders.csv", content_type: "text/csv" } }
    end
  end
end
```

**DSL methods:**

| Method | Default | Description |
|--------|---------|-------------|
| `only(*models)` | all models | Restrict to specific model classes (use strings) |
| `except(*models)` | none | Exclude specific models |
| `member` / `collection` | `member` | Row-level vs table-level action |
| `icon(name)` | nil | Lucide icon name (e.g., "Archive", "Download") |
| `label(text)` | `name.humanize` | Button label |
| `confirm(msg)` | nil | Show confirmation dialog before executing |
| `display(mode)` | `:inline` | `:inline`, `:modal`, or `:page` |
| `http_methods(*methods)` | `[:post]` | HTTP methods the handler responds to |
| `visible(&block)` | always visible | Block receives `(record, user)` for member actions |
| `handler(&block)` | none | Server-side logic block |

**Handler context** — available inside the `handler` block:

| Name | Description |
|------|-------------|
| `@record` | The record (member actions) |
| `@scope` | `Model.all` scope (collection actions) |
| `params` | Request params |
| `request` | HTTP request object |
| `current_user` | Authenticated user |

**Handler return values:**

```ruby
{ success: "msg" }                        # flash notice + redirect back
{ error: "msg" }                          # flash alert + redirect back
{ redirect: "/path" }                     # redirect to path
{ download: { data:, filename: } }        # file download
```

**Display modes:**

- `:inline` — button in the row (member) or toolbar (collection). Click triggers POST directly.
- `:modal` — opens a dialog. Supports GET to fetch data, then POST to execute.
- `:page` — full page at `/new-admin/:model/:id/actions/:name`.

**Authorization:** member actions require `:update` permission, collection actions require `:list`.

#### Custom React Component Override

You can optionally register a React component that replaces the auto-generated UI for a server-defined action:

```ts
window.NewAdmin.registerAction("archive", {
  component: MyCustomArchiveButton,
})
```

The server-defined metadata (scoping, icon, label) still applies — only the rendering is overridden.

#### Pure-Frontend Actions

Actions can also be fully client-side with no Ruby handler:

```ts
window.NewAdmin.registerAction("quick_copy", {
  label: "Copy ID",
  icon: "clipboard",
  component: CopyIdButton,
})
```

**Props interface:**

```ts
interface CustomActionProps {
  record?: RecordData         // { id, display_name, ...columns }
  selectedIds?: Set<string>   // for bulk actions
  modelParamKey: string       // URL param key (e.g. "order")
  modelName: string           // human name (e.g. "Order")
}
```

### Custom Pages

Custom pages render inside the admin layout with full sidebar and header. They appear in the sidebar dropdown and command palette.

```ts
window.NewAdmin.registerPage("analytics", AnalyticsDashboard, { label: "Analytics" })
```

The page is accessible at `/new-admin/pages/analytics`. The `label` option controls how it appears in navigation (defaults to a humanized version of the path).

**Styling note:** Custom components are loaded as a separate IIFE bundle and don't have access to the engine's Tailwind classes. Use **inline styles with CSS custom properties** for theme consistency:

```
var(--background)          var(--foreground)
var(--card)                var(--card-foreground)
var(--primary)             var(--primary-foreground)
var(--muted)               var(--muted-foreground)
var(--accent)              var(--accent-foreground)
var(--border)              var(--destructive)
var(--radius)
```

## Available Icons

Use these Lucide icon names with `navigation_icon`:

`Bell`, `BookOpen`, `Box`, `Calendar`, `CreditCard`, `Database`, `FileText`, `FolderTree`, `Globe`, `Heart`, `Image`, `Layers`, `Lock`, `Mail`, `MapPin`, `MessageSquare`, `Monitor`, `Notebook`, `Package`, `Paperclip`, `PenLine`, `Settings`, `ShoppingCart`, `Star`, `StickyNote`, `Tag`, `Tags`, `Truck`, `Users`

If no icon is configured, NewAdmin auto-detects an icon based on the model name (e.g., models containing "user" get the Users icon, "order" gets ShoppingCart). Models without a match get a colored dot.

## Development

### Running the dummy app

```bash
cd spec/dummy
bin/rails db:setup   # first time only
bin/rails server
# NewAdmin at http://localhost:3000/new-admin
# rails_admin at http://localhost:3000/admin
# Login: admin@example.com / password
```

### Running E2E tests

```bash
cd spec/dummy && bin/rails server  # terminal 1
cd e2e && npm test                  # terminal 2
```

### Building frontend assets

```bash
cd frontend && npm run build
```

## License

MIT
