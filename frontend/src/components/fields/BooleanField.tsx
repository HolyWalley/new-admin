import { FieldWrapper } from "./FieldWrapper";

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
  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
      <div className="flex items-center gap-4 pt-1">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={disabled}
            className="h-4 w-4 text-primary border-input focus:ring-ring"
          />
          Yes
        </label>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={disabled}
            className="h-4 w-4 text-primary border-input focus:ring-ring"
          />
          No
        </label>
        {nullable && (
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === null}
              onChange={() => onChange(null)}
              disabled={disabled}
              className="h-4 w-4 text-primary border-input focus:ring-ring"
            />
            <span className="text-muted-foreground">Not set</span>
          </label>
        )}
      </div>
    </FieldWrapper>
  );
}
