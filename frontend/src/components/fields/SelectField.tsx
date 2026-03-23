import { FieldWrapper } from "./FieldWrapper";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface Option {
  id: number;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  value: number | string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  options: Option[];
  htmlId?: string;
  excludeId?: number | string;
  help?: string;
}

export function SelectField({ name, label, value, onChange, error, required, disabled, options, htmlId, excludeId, help }: SelectFieldProps) {
  const items = excludeId != null ? options.filter((opt) => opt.id !== excludeId) : options;
  const selectedOption = items.find((opt) => String(opt.id) === String(value)) ?? null;
  const hasError = error && error.length > 0;

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId} help={help}>
      <Combobox<Option>
        items={items}
        value={selectedOption}
        onValueChange={(val) => onChange(val ? String(val.id) : "")}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(a, b) => a.id === b.id}
        filter={(item, query) => item.label.toLowerCase().includes(query.toLowerCase())}
      >
        <ComboboxInput
          id={htmlId ?? name}
          data-testid={htmlId ?? name}
          data-slot="select-trigger"
          placeholder="— Select —"
          disabled={disabled}
          showClear={!required && !!selectedOption}
          aria-invalid={hasError || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: Option) => (
              <ComboboxItem key={item.id} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
}
