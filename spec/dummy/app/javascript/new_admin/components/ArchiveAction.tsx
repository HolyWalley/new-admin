import type { CustomActionProps } from "../types"

export default function ArchiveAction({ record, modelParamKey, modelName }: CustomActionProps) {
  if (!record) return null

  function handleArchive() {
    if (!window.confirm(`Archive ${modelName} "${record!.display_name}"?`)) return

    // In a real app, this would POST to a backend endpoint:
    // fetch(`/new-admin/${modelParamKey}/${record.id}/archive`, {
    //   method: "POST",
    //   headers: { "X-CSRF-Token": document.querySelector("meta[name=csrf-token]")?.getAttribute("content") ?? "" },
    // })
    alert(`${modelName} "${record!.display_name}" has been archived. (demo — no backend endpoint)`)
  }

  return (
    <button
      type="button"
      onClick={handleArchive}
      title="Archive"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "28px",
        width: "28px",
        borderRadius: "calc(var(--radius) * 0.6)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--muted-foreground)",
        transition: "background-color 150ms, color 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent)"
        e.currentTarget.style.color = "var(--accent-foreground)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
        e.currentTarget.style.color = "var(--muted-foreground)"
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="5" x="2" y="3" rx="1" />
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
        <path d="M10 12h4" />
      </svg>
    </button>
  )
}
