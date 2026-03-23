import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";

interface MultiSelectFieldProps {
  name: string;
  label: string;
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  options: Array<{ id: number; label: string }>;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
}

export function MultiSelectField({ name, label, value, onChange, options, error, required, disabled, htmlId }: MultiSelectFieldProps) {
  const hasError = error && error.length > 0;
  const selectedSet = new Set(value.map(String));

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions).map((opt) =>
      isNaN(Number(opt.value)) ? opt.value : Number(opt.value)
    );
    onChange(selected);
  }

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <select
        id={htmlId ?? name}
        name={`${name}[]`}
        multiple
        value={Array.from(selectedSet)}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[120px]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
      >
        {options.map((opt) => (
          <option key={opt.id} value={String(opt.id)}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
    </FieldWrapper>
  );
}
