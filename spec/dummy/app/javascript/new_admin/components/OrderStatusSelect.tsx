import type { CustomFieldProps } from "../types"

const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  pending:    { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-600/20" },
  processing: { bg: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-600/20" },
  shipped:    { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-600/20" },
  delivered:  { bg: "bg-green-50",  text: "text-green-700",  ring: "ring-green-600/20" },
  cancelled:  { bg: "bg-red-50",    text: "text-red-700",    ring: "ring-red-600/20" },
  refunded:   { bg: "bg-gray-50",   text: "text-gray-700",   ring: "ring-gray-600/20" },
}

const DEFAULT_COLOR = { bg: "bg-gray-50", text: "text-gray-700", ring: "ring-gray-600/20" }

export default function OrderStatusSelect({
  name,
  label,
  value,
  onChange,
  error,
  required,
  help,
  field,
}: CustomFieldProps) {
  const currentValue = value != null ? String(value) : ""
  const options = field.enum_values ?? []

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const colors = STATUS_COLORS[opt] ?? DEFAULT_COLOR
          const isSelected = currentValue === opt

          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-all cursor-pointer ${colors.bg} ${colors.text} ${colors.ring} ${
                isSelected ? "ring-2 shadow-sm scale-105" : "opacity-60 hover:opacity-80"
              }`}
            >
              {isSelected && (
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M9.765 3.205a.75.75 0 0 1 .03 1.06l-4.25 4.5a.75.75 0 0 1-1.075.015L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.705 1.704 3.72-3.939a.75.75 0 0 1 1.06-.03Z" />
                </svg>
              )}
              {opt}
            </button>
          )
        })}
      </div>

      {help && !error?.length && (
        <p className="text-xs text-muted-foreground">{help}</p>
      )}
      {error?.map((msg, i) => (
        <p key={i} className="text-xs text-destructive">
          {msg}
        </p>
      ))}
    </div>
  )
}
