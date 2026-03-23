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
  FileUploadField,
  RichTextField,
  NestedFormSection,
} from "@/components/fields";
import { getField } from "@/lib/registry";
import type {
  ModelMeta,
  ColumnDef,
  AssociationOptions,
  HasManyThroughOptions,
  PolymorphicOptions,
  NestedFormConfigItem,
  NestedFormData,
  AttachmentInfo,
} from "@/types";

interface ResourceFormProps {
  model: ModelMeta;
  record: Record<string, unknown>;
  associationOptions: AssociationOptions;
  hasManyThroughOptions?: HasManyThroughOptions;
  polymorphicOptions?: PolymorphicOptions;
  nestedFormConfig?: NestedFormConfigItem[];
  nestedFormData?: NestedFormData;
  errors: Record<string, string[]>;
  action: "create" | "update";
  viewColumns?: ColumnDef[];
}

const EXCLUDED_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "encrypted_password",
  "reset_password_token",
  "reset_password_sent_at",
  "remember_created_at",
]);

type NestedRecord = Record<string, unknown> & { id?: number; _destroy?: boolean };

export function ResourceForm({
  model,
  record,
  associationOptions,
  hasManyThroughOptions,
  polymorphicOptions,
  nestedFormConfig,
  nestedFormData,
  errors,
  action,
  viewColumns,
}: ResourceFormProps) {
  // Identify polymorphic associations and their column names to skip
  const polymorphicAssocs = model.associations.filter((a) => a.type === "belongs_to" && a.polymorphic);
  const polymorphicColumns = new Set<string>();
  polymorphicAssocs.forEach((a) => {
    polymorphicColumns.add(`${a.name}_type`);
    polymorphicColumns.add(`${a.name}_id`);
  });

  // Use DSL-provided view_columns when available, otherwise compute from model
  const editableColumns = (viewColumns ?? model.columns).filter((col) => {
    if (col.primary_key) return false;
    if (!viewColumns && EXCLUDED_COLUMNS.has(col.name)) return false;
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
  // Rich text attributes
  model.rich_text_attributes.forEach((attr) => {
    initialValues[attr] = (record[attr] as string) ?? "";
  });

  const [data, setData] = useState(initialValues);
  const [processing, setProcessing] = useState(false);

  // File upload state (separate because File objects can't go in JSON)
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [removeAttachments, setRemoveAttachments] = useState<Set<string>>(new Set());

  // Nested form state
  const initialNested: Record<string, NestedRecord[]> = {};
  if (nestedFormConfig && nestedFormData) {
    nestedFormConfig.forEach((cfg) => {
      const raw = nestedFormData[cfg.association_name];
      if (cfg.type === "has_one") {
        initialNested[cfg.association_name] = raw ? [raw as NestedRecord] : [];
      } else {
        initialNested[cfg.association_name] = (raw as NestedRecord[]) ?? [];
      }
    });
  }
  const [nestedData, setNestedData] = useState(initialNested);

  function setValue(name: string, value: unknown) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  function setFile(name: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [name]: file }));
  }

  function toggleRemoveAttachment(name: string) {
    setRemoveAttachments((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function setNestedRecords(assocName: string, records: NestedRecord[]) {
    setNestedData((prev) => ({ ...prev, [assocName]: records }));
  }

  function hasFiles(): boolean {
    return Object.values(files).some((f) => f != null);
  }

  function buildPayload(): Record<string, unknown> | FormData {
    const modelData: Record<string, unknown> = { ...data };

    // Add nested attributes
    if (nestedFormConfig) {
      nestedFormConfig.forEach((cfg) => {
        const records = nestedData[cfg.association_name] ?? [];
        const attrKey = `${cfg.association_name}_attributes`;
        if (cfg.type === "has_one") {
          modelData[attrKey] = records[0] ?? {};
        } else {
          // Convert array to indexed hash for Rails
          const indexed: Record<string, unknown> = {};
          records.forEach((rec, i) => {
            indexed[String(i)] = rec;
          });
          modelData[attrKey] = indexed;
        }
      });
    }

    // If we have files, use FormData
    if (hasFiles()) {
      const formData = new FormData();
      const prefix = model.param_key;

      // Flatten data into FormData
      Object.entries(modelData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${prefix}[${key}][]`, String(v)));
        } else if (typeof value === "object" && !(value instanceof File)) {
          // Nested attributes
          flattenToFormData(formData, `${prefix}[${key}]`, value as Record<string, unknown>);
        } else {
          formData.append(`${prefix}[${key}]`, String(value));
        }
      });

      // Add files
      Object.entries(files).forEach(([name, file]) => {
        if (file) {
          formData.append(`${prefix}[${name}]`, file);
        }
      });

      return formData;
    }

    return { [model.param_key]: modelData };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const url =
      action === "create"
        ? `/new-admin/${model.param_key}`
        : `/new-admin/${model.param_key}/${record.id}`;

    const payload = buildPayload();

    if (action === "create") {
      router.post(url, payload as never, {
        onFinish: () => setProcessing(false),
      });
    } else {
      // For file uploads with PATCH, Inertia uses _method spoofing
      if (payload instanceof FormData) {
        payload.append("_method", "patch");
        router.post(url, payload as never, {
          onFinish: () => setProcessing(false),
        });
      } else {
        router.patch(url, payload as never, {
          onFinish: () => setProcessing(false),
        });
      }
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

        // Custom component override — registered via registerField()
        if (col.custom_component) {
          const CustomField = getField(col.custom_component);
          if (CustomField) {
            return (
              <CustomField
                key={col.name}
                name={col.name}
                label={col.label ?? col.name}
                value={value}
                onChange={(v) => setValue(col.name, v)}
                error={error}
                required={required}
                help={col.help}
                field={col}
              />
            );
          }
          // If not found in registry, fall through to defaults
        }

        // Foreign key → SelectField
        if (isForeignKey(col)) {
          const assoc = findAssociationForFk(col.name);
          const isSelfRef = assoc && assoc.target_model === model.name;
          return (
            <SelectField
              key={col.name}
              name={col.name}
              label={col.label ?? assoc?.name ?? col.name}
              htmlId={fieldHtmlId}
              value={value as number | string | null}
              onChange={(v) => setValue(col.name, v)}
              options={associationOptions[col.name] ?? []}
              error={error}
              required={required}
              excludeId={isSelfRef && action === "update" ? (record.id as number | string) : undefined}
              help={col.help}
            />
          );
        }

        // Enum → EnumField
        if (col.type === "enum" && col.enum_values) {
          return (
            <EnumField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              options={col.enum_values}
              error={error}
              required={required}
              nullable={col.nullable}
              help={col.help}
            />
          );
        }

        // Boolean
        if (col.type === "boolean") {
          return (
            <BooleanField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as boolean | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              nullable={col.nullable}
              help={col.help}
            />
          );
        }

        // Text
        if (col.type === "text") {
          return (
            <TextField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              help={col.help}
            />
          );
        }

        // Datetime
        if (col.type === "datetime") {
          return (
            <DateTimeField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              help={col.help}
            />
          );
        }

        // Date
        if (col.type === "date") {
          return (
            <DateField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              help={col.help}
            />
          );
        }

        // Integer, Decimal, Float
        if (col.type === "integer" || col.type === "decimal" || col.type === "float") {
          return (
            <NumberField
              key={col.name}
              name={col.name}
              label={col.label ?? col.name}
              htmlId={fieldHtmlId}
              value={value as number | string | null}
              onChange={(v) => setValue(col.name, v)}
              error={error}
              required={required}
              step={col.type === "integer" ? "1" : "0.01"}
              help={col.help}
            />
          );
        }

        // Default: string
        return (
          <StringField
            key={col.name}
            name={col.name}
            label={col.label ?? col.name}
            htmlId={fieldHtmlId}
            value={value as string | null}
            onChange={(v) => setValue(col.name, v)}
            error={error}
            required={required}
            help={col.help}
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

      {/* ActiveStorage file upload fields */}
      {model.attachment_attributes.map((att) => {
        const attachmentKey = `_attachment_${att.name}`;
        const existing = record[attachmentKey] as AttachmentInfo | undefined;
        return (
          <FileUploadField
            key={att.name}
            name={att.name}
            label={att.name}
            htmlId={htmlId(att.name)}
            onChange={(file) => setFile(att.name, file)}
            error={getError(att.name)}
            existingAttachment={existing ?? null}
            onRemove={() => toggleRemoveAttachment(att.name)}
            removeFlag={removeAttachments.has(att.name)}
          />
        );
      })}

      {/* ActionText rich text fields */}
      {model.rich_text_attributes.map((attr) => (
        <RichTextField
          key={attr}
          name={attr}
          label={attr}
          htmlId={htmlId(attr)}
          value={data[attr] as string | null}
          onChange={(v) => setValue(attr, v)}
          error={getError(attr)}
        />
      ))}

      {/* Nested form sections */}
      {nestedFormConfig?.map((cfg) => (
        <NestedFormSection
          key={cfg.association_name}
          config={cfg}
          records={nestedData[cfg.association_name] ?? []}
          onChange={(records) => setNestedRecords(cfg.association_name, records)}
          parentParamKey={model.param_key}
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

function flattenToFormData(formData: FormData, prefix: string, obj: Record<string, unknown>) {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = `${prefix}[${key}]`;
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${fullKey}[]`, String(v)));
    } else if (typeof value === "object" && !(value instanceof File)) {
      flattenToFormData(formData, fullKey, value as Record<string, unknown>);
    } else {
      formData.append(fullKey, String(value));
    }
  });
}
