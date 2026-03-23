import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  name: string;
  label: string;
  value: number | string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  step?: string;
}

export function NumberField({ name, label, value, onChange, error, required, disabled, step = "1" }: NumberFieldProps) {
  const hasError = error && error.length > 0;
  return (
    <FieldWrapper name={name} label={label} error={error} required={required}>
      <Input
        id={name}
        name={name}
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  );
}
