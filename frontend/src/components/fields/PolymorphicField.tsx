import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";
import type { PolymorphicTarget } from "@/types";

interface PolymorphicFieldProps {
  associationName: string;
  htmlIdPrefix: string;
  typeValue: string | null;
  idValue: number | string | null;
  onTypeChange: (value: string) => void;
  onIdChange: (value: string) => void;
  targets: PolymorphicTarget[];
  error?: string[];
}

const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function PolymorphicField({
  associationName,
  htmlIdPrefix,
  typeValue,
  idValue,
  onTypeChange,
  onIdChange,
  targets,
  error,
}: PolymorphicFieldProps) {
  const hasError = error && error.length > 0;
  const currentTarget = targets.find((t) => t.model_name === typeValue);

  return (
    <div className="space-y-3">
      <FieldWrapper
        name={`${associationName}_type`}
        label={`${associationName} type`}
        htmlId={`${htmlIdPrefix}_type`}
        error={hasError ? error : undefined}
      >
        <select
          id={`${htmlIdPrefix}_type`}
          name={`${associationName}_type`}
          value={typeValue ?? ""}
          onChange={(e) => {
            onTypeChange(e.target.value);
            onIdChange("");
          }}
          className={cn(selectClass, hasError && "border-destructive focus-visible:ring-destructive")}
        >
          <option value="">— Select type —</option>
          {targets.map((t) => (
            <option key={t.model_name} value={t.model_name}>
              {t.model_name}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper
        name={`${associationName}_id`}
        label={`${associationName} id`}
        htmlId={`${htmlIdPrefix}_id`}
      >
        <select
          id={`${htmlIdPrefix}_id`}
          name={`${associationName}_id`}
          value={idValue != null ? String(idValue) : ""}
          onChange={(e) => onIdChange(e.target.value)}
          disabled={!currentTarget}
          className={cn(selectClass, !currentTarget && "opacity-50")}
        >
          <option value="">— Select record —</option>
          {currentTarget?.records.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    </div>
  );
}
