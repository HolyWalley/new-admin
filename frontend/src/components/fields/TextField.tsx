import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface TextFieldProps {
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

export function TextField({ name, label, value, onChange, error, required, disabled, htmlId, help }: TextFieldProps) {
  const hasError = error && error.length > 0;
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId} help={help}>
      <textarea
        id={htmlId ?? name}
        name={name}
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </FieldWrapper>
  );
}
