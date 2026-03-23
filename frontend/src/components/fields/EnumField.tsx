import { FieldWrapper } from "./FieldWrapper";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

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
      <Combobox<string>
        items={options}
        value={value || null}
        onValueChange={(val) => onChange(val ?? "")}
      >
        <ComboboxInput
          id={htmlId ?? name}
          data-testid={htmlId ?? name}
          data-slot="select-trigger"
          placeholder="— Select —"
          disabled={disabled}
          showClear={nullable && !!value}
          aria-invalid={hasError || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
}
