import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface DateTimeFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
}

export function DateTimeField({ name, label, value, onChange, error, required, disabled }: DateTimeFieldProps) {
  const hasError = error && error.length > 0;

  // Convert ISO datetime to datetime-local format
  const inputValue = value ? toDatetimeLocal(String(value)) : "";

  return (
    <FieldWrapper name={name} label={label} error={error} required={required}>
      <Input
        id={name}
        name={name}
        type="datetime-local"
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  );
}

function toDatetimeLocal(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    // Format: YYYY-MM-DDTHH:MM
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return iso;
  }
}
