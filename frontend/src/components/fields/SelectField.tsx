import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  name: string;
  label: string;
  value: number | string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  options: Array<{ id: number; label: string }>;
  htmlId?: string;
  excludeId?: number | string;
}

export function SelectField({ name, label, value, onChange, error, required, disabled, options, htmlId, excludeId }: SelectFieldProps) {
  const hasError = error && error.length > 0;
  const filteredOptions = excludeId != null ? options.filter((opt) => opt.id !== excludeId) : options;
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <select
        id={htmlId ?? name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
      >
        <option value="">— Select —</option>
        {filteredOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
