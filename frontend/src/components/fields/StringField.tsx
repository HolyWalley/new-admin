import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface StringFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
  help?: string;
}

export function StringField({ name, label, value, onChange, error, required, disabled, htmlId, help }: StringFieldProps) {
  const hasError = error && error.length > 0;
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId} help={help}>
      <Input
        id={htmlId ?? name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  );
}
