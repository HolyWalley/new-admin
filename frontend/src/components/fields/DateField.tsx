import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
}

export function DateField({ name, label, value, onChange, error, required, disabled, htmlId }: DateFieldProps) {
  const hasError = error && error.length > 0;

  // Convert ISO date to YYYY-MM-DD format
  const inputValue = value ? toDateInput(String(value)) : "";

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <Input
        id={htmlId ?? name}
        name={name}
        type="date"
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  );
}

function toDateInput(iso: string): string {
  try {
    // If already YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch {
    return iso;
  }
}
