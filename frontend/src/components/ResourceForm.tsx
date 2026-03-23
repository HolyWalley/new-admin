import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  StringField,
  TextField,
  NumberField,
  BooleanField,
  DateTimeField,
  DateField,
  EnumField,
  SelectField,
  MultiSelectField,
  PolymorphicField,
} from "@/components/fields";
import type { ModelMeta, ColumnDef, AssociationOptions, HasManyThroughOptions, PolymorphicOptions } from "@/types";

interface ResourceFormProps {
  model: ModelMeta;
  record: Record<string, unknown>;
  associationOptions: AssociationOptions;
  hasManyThroughOptions?: HasManyThroughOptions;
  polymorphicOptions?: PolymorphicOptions;
  errors: Record<string, string[]>;
  action: "create" | "update";
}

const EXCLUDED_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "encrypted_password",
  "reset_password_token",
  "reset_password_sent_at",
  "remember_created_at",
]);

export function ResourceForm({ model, record, associationOptions, hasManyThroughOptions, polymorphicOptions, errors, action }: ResourceFormProps) {
  // Identify polymorphic associations and their column names to skip
  const polymorphicAssocs = model.associations.filter((a) => a.type === "belongs_to" && a.polymorphic);
  const polymorphicColumns = new Set<string>();
  polymorphicAssocs.forEach((a) => {
    polymorphicColumns.add(`${a.name}_type`);
    polymorphicColumns.add(`${a.name}_id`);
  });

  const editableColumns = model.columns.filter((col) => {
    if (col.primary_key) return false;
    if (EXCLUDED_COLUMNS.has(col.name)) return false;
    if (col.name === "type" && model.sti) return false;
    // Skip polymorphic type/id columns — rendered as PolymorphicField
    if (polymorphicColumns.has(col.name)) return false;
    return true;
  });

  // Initialize form data
  const initialValues: Record<string, unknown> = {};
  editableColumns.forEach((col) => {
    initialValues[col.name] = record[col.name] ?? (col.type === "boolean" ? false : "");
  });
  // Polymorphic columns
  polymorphicAssocs.forEach((a) => {
    initialValues[`${a.name}_type`] = record[`${a.name}_type`] ?? "";
    initialValues[`${a.name}_id`] = record[`${a.name}_id`] ?? "";
  });
  // has_many :through IDs
  if (hasManyThroughOptions) {
    Object.values(hasManyThroughOptions).forEach((opt) => {
      initialValues[opt.ids_field] = (record[opt.ids_field] as unknown[]) ?? [];
    });
  }

  const [data, setData] = useState(initialValues);
  const [processing, setProcessing] = useState(false);

  function setValue(name: string, value: unknown) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const url =
      action === "create"
        ? `/new-admin/${model.param_key}`
        : `/new-admin/${model.param_key}/${record.id}`;

    const payload = { [model.param_key]: data } as Record<string, unknown>;

    if (action === "create") {
      router.post(url, payload as never, {
        onFinish: () => setProcessing(false),
      });
    } else {
      router.patch(url, payload as never, {
        onFinish: () => setProcessing(false),
      });
    }
  }

  function getError(name: string): string[] | undefined {
    const err = errors[name];
    if (!err) return undefined;
    return Array.isArray(err) ? err : [err];
  }

  function isForeignKey(col: ColumnDef): boolean {
    return col.foreign_key === true && !!associationOptions[col.name];
  }

  function findAssociationForFk(colName: string) {
    return model.associations.find(
      (a) => a.type === "belongs_to" && a.foreign_key === colName
    );
  }

  function htmlId(fieldName: string): string {
    return `${model.param_key}_${fieldName}`;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {editableColumns.map((col) => {
        const value = data[col.name];
        const error = getError(col.name);
        const required = !col.nullable;
        const fieldHtmlId = htmlId(col.name);

        // Foreign key → SelectField
        if (isForeignKey(col)) {
          const assoc = findAssociationForFk(col.name);
          const isSelfRef = assoc && assoc.target_model === model.name;
          return (
            <SelectField
              key={col.name}
              name={col.name}
              label={assoc?.name ?? col.name}
              htmlId={fieldHtmlId}
              value={value as number | string | null}
              onChange={(v) => setValue(col.name, v)}
              options={associationOptions[col.name] ?? []}
              error={error}
              required={required}
              excludeId={isSelfRef && action === "update" ? (record.id as number | string) : undefined}
            />
          );
        }

        // Enum → EnumField
        if (col.type === "enum" && col.enum_values) {
          return (
            <EnumField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              options={col.enum_values}
              error={error}
              required={required}
              nullable={col.nullable}
            />
          );
        }

        // Boolean
        if (col.type === "boolean") {
          return (
            <BooleanField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as boolean | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              nullable={col.nullable}
            />
          );
        }

        // Text
        if (col.type === "text") {
          return (
            <TextField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
            />
          );
        }

        // Datetime
        if (col.type === "datetime") {
          return (
            <DateTimeField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
            />
          );
        }

        // Date
        if (col.type === "date") {
          return (
            <DateField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
            />
          );
        }

        // Integer, Decimal, Float
        if (col.type === "integer" || col.type === "decimal" || col.type === "float") {
          return (
            <NumberField
              key={col.name}
              name={col.name}
              label={col.name}
              htmlId={fieldHtmlId}
              value={value as number | string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              step={col.type === "integer" ? "1" : "0.01"}
            />
          );
        }

        // Default: string
        return (
          <StringField
            key={col.name}
            name={col.name}
            label={col.name}
            htmlId={fieldHtmlId}
            value={value as string | null}
            onChange={(v) => setValue(col.name, v)}
            error={error}
            required={required}
          />
        );
      })}

      {/* Polymorphic association fields */}
      {polymorphicAssocs.map((assoc) => {
        const targets = polymorphicOptions?.[assoc.name] ?? [];
        if (targets.length === 0) return null;
        return (
          <PolymorphicField
            key={assoc.name}
            associationName={assoc.name}
            htmlIdPrefix={htmlId(assoc.name)}
            typeValue={data[`${assoc.name}_type`] as string | null}
            idValue={data[`${assoc.name}_id`] as number | string | null}
            onTypeChange={(v) => setValue(`${assoc.name}_type`, v)}
            onIdChange={(v) => setValue(`${assoc.name}_id`, v)}
            targets={targets}
            error={getError(`${assoc.name}_type`)}
          />
        );
      })}

      {/* has_many :through multi-select fields */}
      {hasManyThroughOptions && Object.entries(hasManyThroughOptions).map(([assocName, opt]) => (
        <MultiSelectField
          key={assocName}
          name={opt.ids_field}
          label={assocName}
          htmlId={htmlId(opt.ids_field)}
          value={(data[opt.ids_field] as (number | string)[]) ?? []}
          onChange={(v) => setValue(opt.ids_field, v)}
          options={opt.options}
          error={getError(opt.ids_field)}
        />
      ))}

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={processing}>
          {processing ? "Saving..." : action === "create" ? "Create" : "Update"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={processing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
