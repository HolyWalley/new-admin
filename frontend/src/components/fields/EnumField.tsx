import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface EnumFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  options: string[];
  nullable?: boolean;
  htmlId?: string;
}

export function EnumField({ name, label, value, onChange, error, required, disabled, options, nullable, htmlId }: EnumFieldProps) {
  const hasError = error && error.length > 0;
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
        {nullable && <option value="">— Select —</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
