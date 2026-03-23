// NewAdmin custom components entry point
// Register your custom field components, actions, and pages here.

import OrderStatusSelect from "./components/OrderStatusSelect"
import ArchiveAction from "./components/ArchiveAction"
import AnalyticsDashboard from "./components/AnalyticsDashboard"

if (window.NewAdmin) {
  // Custom field: colored pill selector for order status
  window.NewAdmin.registerField("OrderStatusSelect", OrderStatusSelect)

  // Custom action: archive button shown in every row's actions column
  window.NewAdmin.registerAction("archive", {
    label: "Archive",
    icon: "archive",
    component: ArchiveAction,
  })

  // Custom page: analytics dashboard at /new-admin/pages/analytics
  window.NewAdmin.registerPage("analytics", AnalyticsDashboard, { label: "Analytics" })
}
