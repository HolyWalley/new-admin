import { FieldWrapper } from "./FieldWrapper";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox";

interface Option {
  id: number;
  label: string;
}

interface MultiSelectFieldProps {
  name: string;
  label: string;
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  options: Option[];
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
  help?: string;
}

export function MultiSelectField({ name, label, value, onChange, options, error, required, disabled, htmlId, help }: MultiSelectFieldProps) {
  const hasError = error && error.length > 0;
  const anchorRef = useComboboxAnchor();

  const selectedSet = new Set(value.map(String));
  const selectedOptions = options.filter((opt) => selectedSet.has(String(opt.id)));

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId} help={help}>
      {/* Hidden select for E2E test compatibility */}
      <select
        id={htmlId ?? name}
        name={`${name}[]`}
        multiple
        value={Array.from(selectedSet)}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {options.map((opt) => (
          <option key={opt.id} value={String(opt.id)}>
            {opt.label}
          </option>
        ))}
      </select>

      <Combobox
        multiple
        items={options}
        value={selectedOptions as never}
        onValueChange={(vals) => onChange((vals as unknown as Option[]).map((v) => v.id))}
        itemToStringLabel={(item: Option) => item.label}
        isItemEqualToValue={(a: Option, b: Option) => a.id === b.id}
        filter={(item: Option, query: string) => item.label.toLowerCase().includes(query.toLowerCase())}
      >
        <ComboboxChips
          ref={anchorRef}
          data-slot="select-trigger"
          aria-invalid={hasError || undefined}
        >
          {((chip: Option) => (
            <ComboboxChip key={chip.id}>
              {chip.label}
            </ComboboxChip>
          )) as unknown as React.ReactNode}
          <ComboboxChipsInput
            placeholder={selectedOptions.length === 0 ? "— Select —" : "Search..."}
            disabled={disabled}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
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
