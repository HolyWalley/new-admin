import { FieldWrapper } from "./FieldWrapper";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface BooleanFieldProps {
  name: string;
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  nullable?: boolean;
  htmlId?: string;
}

export function BooleanField({ name, label, value, onChange, error, required, disabled, nullable, htmlId }: BooleanFieldProps) {
  const selectValue = value === true ? "true" : value === false ? "false" : "";

  function handleChange(val: string | null) {
    const v = val as string;
    if (v === "true") onChange(true);
    else if (v === "false") onChange(false);
    else onChange(null);
  }

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-invalid={error && error.length > 0 ? true : undefined}>
          <SelectValue placeholder="— Select —" />
        </SelectTrigger>
        <SelectContent>
          {nullable && <SelectItem value="">Not set</SelectItem>}
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
