import { FieldWrapper } from "./FieldWrapper";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <Select
        value={value ?? ""}
        onValueChange={(val) => onChange(val as string)}
        disabled={disabled}
      >
        <SelectTrigger id={htmlId ?? name} className="w-full" aria-invalid={error && error.length > 0 ? true : undefined}>
          <SelectValue placeholder="— Select —" />
        </SelectTrigger>
        <SelectContent>
          {nullable && <SelectItem value="">— Select —</SelectItem>}
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
