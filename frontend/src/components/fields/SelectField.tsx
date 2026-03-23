import { FieldWrapper } from "./FieldWrapper";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const filteredOptions = excludeId != null ? options.filter((opt) => opt.id !== excludeId) : options;
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(val) => onChange(val as string)}
        disabled={disabled}
      >
        <SelectTrigger id={htmlId ?? name} data-testid={htmlId ?? name} className="w-full" aria-invalid={error && error.length > 0 ? true : undefined}>
          <SelectValue placeholder="— Select —" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">— Select —</SelectItem>
          {filteredOptions.map((opt) => (
            <SelectItem key={opt.id} value={String(opt.id)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
