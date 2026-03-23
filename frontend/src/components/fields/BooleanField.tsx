import { FieldWrapper } from "./FieldWrapper";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

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

type BoolOption = { key: string; label: string };

const YES_OPTION: BoolOption = { key: "true", label: "Yes" };
const NO_OPTION: BoolOption = { key: "false", label: "No" };
const NOT_SET_OPTION: BoolOption = { key: "", label: "Not set" };

export function BooleanField({ name, label, value, onChange, error, required, disabled, nullable, htmlId }: BooleanFieldProps) {
  const hasError = error && error.length > 0;
  const items = nullable ? [YES_OPTION, NO_OPTION, NOT_SET_OPTION] : [YES_OPTION, NO_OPTION];
  const selected = value === true ? YES_OPTION : value === false ? NO_OPTION : nullable ? NOT_SET_OPTION : null;

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <Combobox<BoolOption>
        items={items}
        value={selected}
        onValueChange={(val) => {
          if (!val || val.key === "") onChange(null);
          else if (val.key === "true") onChange(true);
          else onChange(false);
        }}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(a, b) => a.key === b.key}
        filter={(item, query) => item.label.toLowerCase().includes(query.toLowerCase())}
        autoComplete="none"
      >
        <ComboboxInput
          id={htmlId ?? name}
          placeholder="— Select —"
          disabled={disabled}
          aria-invalid={hasError || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: BoolOption) => (
              <ComboboxItem key={item.key} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
}
