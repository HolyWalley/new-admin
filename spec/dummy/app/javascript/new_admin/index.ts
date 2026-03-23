// NewAdmin custom components entry point
// Register your custom field components, actions, and pages here.

import OrderStatusSelect from "./components/OrderStatusSelect"
import AnalyticsDashboard from "./components/AnalyticsDashboard"

if (window.NewAdmin) {
  // Custom field: colored pill selector for order status
  window.NewAdmin.registerField("OrderStatusSelect", OrderStatusSelect)

  // Custom page: analytics dashboard at /new-admin/pages/analytics
  window.NewAdmin.registerPage("analytics", AnalyticsDashboard, { label: "Analytics" })

  // Note: The "archive" action is now server-defined in config/initializers/new_admin.rb
  // with a Ruby handler — zero JS needed. The DefaultActionButton renders it automatically.
  // See ArchiveAction.tsx for an example of a pure-frontend custom action component.
}
