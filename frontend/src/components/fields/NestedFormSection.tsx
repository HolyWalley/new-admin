import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnDef, NestedFormConfigItem } from "@/types";

type NestedRecord = Record<string, unknown> & { id?: number; _destroy?: boolean };

interface NestedFormSectionProps {
  config: NestedFormConfigItem;
  records: NestedRecord[];
  onChange: (records: NestedRecord[]) => void;
  parentParamKey: string;
}

const EXCLUDED_NESTED_COLUMNS = new Set(["created_at", "updated_at"]);

export function NestedFormSection({ config, records, onChange, parentParamKey }: NestedFormSectionProps) {
  const editableColumns = config.target_columns.filter(
    (col) => !col.primary_key && !EXCLUDED_NESTED_COLUMNS.has(col.name)
  );

  // Skip the back-reference foreign key to the parent model
  const parentFkColumn = editableColumns.find((col) => {
    return col.foreign_key && col.name === `${parentParamKey}_id`;
  });
  const visibleColumns = editableColumns.filter((col) => col !== parentFkColumn);

  function updateRecord(index: number, field: string, value: unknown) {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function markForDestroy(index: number) {
    const updated = [...records];
    updated[index] = { ...updated[index], _destroy: true };
    onChange(updated);
  }

  function undoDestroy(index: number) {
    const updated = [...records];
    updated[index] = { ...updated[index], _destroy: false };
    onChange(updated);
  }

  function addRecord() {
    const blank: NestedRecord = {};
    visibleColumns.forEach((col) => {
      blank[col.name] = col.type === "boolean" ? false : "";
    });
    onChange([...records, blank]);
  }

  const sectionClass = `${config.association_name}_field`;
  const idPrefix = `${parentParamKey}_${config.target_param_key}`;

  if (config.type === "has_one") {
    const record = records[0] || {};
    return (
      <div className={cn(sectionClass, "space-y-3 rounded-md border border-border p-4")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground capitalize">
            {config.association_name.replace(/_/g, " ")}
          </h3>
          {config.allow_destroy && record.id && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (record._destroy) {
                  undoDestroy(0);
                } else {
                  markForDestroy(0);
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              {record._destroy ? "Undo remove" : "Remove"}
            </Button>
          )}
        </div>
        {!record._destroy && (
          <div className="grid grid-cols-2 gap-3">
            {visibleColumns.map((col) => (
              <NestedField
                key={col.name}
                column={col}
                value={record[col.name]}
                onChange={(v) => updateRecord(0, col.name, v)}
                htmlId={`${idPrefix}_${col.name}`}
                associationOptions={config.association_options}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // has_many
  const activeRecords = records.filter((r) => !r._destroy);
  const destroyedRecords = records.filter((r) => r._destroy);

  return (
    <div className={cn(sectionClass, "space-y-3")}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground capitalize">
          {config.association_name.replace(/_/g, " ")}
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={addRecord}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>

      {activeRecords.length === 0 && destroyedRecords.length === 0 && (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      )}

      {records.map((record, index) => {
        if (record._destroy) return null;
        return (
          <div
            key={record.id ?? `new_${index}`}
            className="rounded-md border border-border p-3 space-y-2"
            id={`${idPrefix}_${index}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                #{record.id ?? "New"}
              </span>
              {config.allow_destroy && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => markForDestroy(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visibleColumns.map((col) => (
                <NestedField
                  key={col.name}
                  column={col}
                  value={record[col.name]}
                  onChange={(v) => updateRecord(index, col.name, v)}
                  htmlId={`${idPrefix}_${index}_${col.name}`}
                  associationOptions={config.association_options}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NestedField({
  column,
  value,
  onChange,
  htmlId,
  associationOptions,
}: {
  column: ColumnDef;
  value: unknown;
  onChange: (v: unknown) => void;
  htmlId: string;
  associationOptions: Record<string, Array<{ id: number; label: string }>>;
}) {
  const baseClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  // Foreign key with options → select
  if (column.foreign_key && associationOptions[column.name]) {
    const options = associationOptions[column.name];
    return (
      <div className="space-y-1">
        <label htmlFor={htmlId} className="text-xs font-medium text-muted-foreground">
          {column.name}
        </label>
        <select
          id={htmlId}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (column.type === "boolean") {
    return (
      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id={htmlId}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor={htmlId} className="text-xs font-medium text-muted-foreground">
          {column.name}
        </label>
      </div>
    );
  }

  if (column.type === "integer" || column.type === "decimal" || column.type === "float") {
    return (
      <div className="space-y-1">
        <label htmlFor={htmlId} className="text-xs font-medium text-muted-foreground">
          {column.name}
        </label>
        <input
          type="number"
          id={htmlId}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          step={column.type === "integer" ? "1" : "0.01"}
          className={baseClass}
        />
      </div>
    );
  }

  if (column.type === "text") {
    return (
      <div className="space-y-1 col-span-2">
        <label htmlFor={htmlId} className="text-xs font-medium text-muted-foreground">
          {column.name}
        </label>
        <textarea
          id={htmlId}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    );
  }

  // Default: string input
  return (
    <div className="space-y-1">
      <label htmlFor={htmlId} className="text-xs font-medium text-muted-foreground">
        {column.name}
      </label>
      <input
        type="text"
        id={htmlId}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
    </div>
  );
}
