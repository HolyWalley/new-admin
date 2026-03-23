const STATS = [
  { label: "Total Orders", value: "1,234", change: "+12.5%", positive: true },
  { label: "Revenue", value: "$45,678", change: "+8.2%", positive: true },
  { label: "Avg Order Value", value: "$37.01", change: "-2.1%", positive: false },
  { label: "Pending Orders", value: "23", change: "+3", positive: false },
]

const MONTHLY_DATA = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 90 },
  { month: "Apr", value: 81 },
  { month: "May", value: 95 },
  { month: "Jun", value: 110 },
]

const TOP_PRODUCTS = [
  { name: "Wireless Headphones", orders: 342, revenue: "$12,654" },
  { name: "USB-C Hub", orders: 256, revenue: "$7,680" },
  { name: "Mechanical Keyboard", orders: 198, revenue: "$15,840" },
  { name: "Monitor Stand", orders: 167, revenue: "$5,010" },
  { name: "Laptop Sleeve", orders: 145, revenue: "$2,900" },
]

const MAX_VALUE = Math.max(...MONTHLY_DATA.map((d) => d.value))

const card: React.CSSProperties = {
  padding: "20px",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
}

export default function AnalyticsDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
          }}
        >
          Analytics
        </h2>
        <p style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          Overview of your store performance.{" "}
          <em style={{ opacity: 0.7 }}>This is a custom page registered via NewAdmin.registerPage.</em>
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} style={card}>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                marginTop: "4px",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "4px",
                color: stat.positive ? "#16a34a" : "#dc2626",
              }}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Orders Bar Chart */}
      <div style={card}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Monthly Orders</h3>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            height: "160px",
            padding: "0 8px",
          }}
        >
          {MONTHLY_DATA.map((d) => (
            <div
              key={d.month}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{d.value}</span>
              <div
                style={{
                  width: "100%",
                  height: `${(d.value / MAX_VALUE) * 120}px`,
                  backgroundColor: "var(--primary)",
                  borderRadius: "4px 4px 0 0",
                  opacity: 0.8,
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products Table */}
      <div style={card}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Top Products</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                color: "var(--muted-foreground)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px 12px", fontWeight: 500 }}>Product</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Orders</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {TOP_PRODUCTS.map((product, i) => (
              <tr
                key={product.name}
                style={{
                  borderBottom:
                    i < TOP_PRODUCTS.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <td style={{ padding: "10px 12px" }}>{product.name}</td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {product.orders}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {product.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
