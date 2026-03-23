export interface ColumnDef {
  name: string;
  type:
    | "string"
    | "text"
    | "integer"
    | "decimal"
    | "float"
    | "boolean"
    | "date"
    | "datetime"
    | "time"
    | "enum"
    | "json"
    | "binary";
  nullable: boolean;
  primary_key: boolean;
  default?: string | number | boolean | null;
  limit?: number;
  enum_values?: string[];
  foreign_key?: boolean;
  label?: string;
  help?: string;
  custom_component?: string;
}

export interface CustomFieldProps {
  name: string;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string[];
  required?: boolean;
  help?: string;
  field: ColumnDef;
}

export interface CustomActionProps {
  record?: RecordData;
  selectedIds?: Set<number | string>;
  modelParamKey: string;
  modelName: string;
}

export interface CustomActionConfig {
  label: string;
  icon?: string;
  component: React.ComponentType<CustomActionProps>;
}

export interface AssociationDef {
  name: string;
  type: "belongs_to" | "has_many" | "has_many_through" | "has_one";
  target_model: string | null;
  foreign_key?: string;
  polymorphic?: boolean;
  through?: string;
  nested_attributes?: boolean;
  dependent?: string;
}

export interface ModelMeta {
  name: string;
  param_key: string;
  table_name: string;
  primary_key: string;
  count: number;
  sti: boolean;
  sti_base: boolean;
  to_s_method: string;
  columns: ColumnDef[];
  associations: AssociationDef[];
  enums: Record<string, string[]>;
  rich_text_attributes: string[];
  attachment_attributes: Array<{ name: string; multiple: boolean }>;
}

export interface Permissions {
  list: boolean;
  show: boolean;
  create: boolean;
  update: boolean;
  destroy: boolean;
}

export interface ModelSummary {
  name: string;
  param_key: string;
  count: number;
  navigation_group?: string | null;
  sti?: boolean;
  sti_base?: boolean;
  permissions?: Permissions;
  icon?: string;
  weight?: number;
}

export interface NavigationGroup {
  label: string;
  models: string[];
}

export type RecordData = Record<string, unknown> & {
  id: number | string;
  display_name: string;
};

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface SortState {
  column: string;
  direction: "asc" | "desc";
}

export interface AssociationData {
  name: string;
  type: "belongs_to" | "has_many" | "has_many_through" | "has_one";
  target_model: string | null;
  record?: { id: number; display_name: string; param_key: string };
  count?: number;
  param_key?: string;
  foreign_key?: string;
}

export type AssociationOptions = Record<
  string,
  Array<{ id: number; label: string }>
>;

export interface HasManyThroughOption {
  ids_field: string;
  options: Array<{ id: number; label: string }>;
  target_model: string;
}

export type HasManyThroughOptions = Record<string, HasManyThroughOption>;

export interface PolymorphicTarget {
  model_name: string;
  param_key: string;
  records: Array<{ id: number; label: string }>;
}

export type PolymorphicOptions = Record<string, PolymorphicTarget[]>;

export interface AttachmentInfo {
  filename: string;
  content_type?: string;
  byte_size?: number;
  url?: string;
  thumbnail_url?: string;
}

export interface NestedFormConfigItem {
  association_name: string;
  type: "has_many" | "has_one";
  allow_destroy: boolean;
  target_param_key: string;
  target_columns: ColumnDef[];
  association_options: Record<string, Array<{ id: number; label: string }>>;
}

export type NestedFormData = Record<string, Record<string, unknown> | Record<string, unknown>[]>;

export interface FilterRule {
  column: string;
  operator: string;
  value: string;
  value2?: string;
}

export type ColumnType = ColumnDef["type"];

export const FILTER_OPERATORS: Record<string, Array<{ key: string; label: string; unary?: boolean }>> = {
  string: [
    { key: "contains", label: "contains" },
    { key: "not_contains", label: "doesn't contain" },
    { key: "is", label: "is exactly" },
    { key: "starts_with", label: "starts with" },
    { key: "ends_with", label: "ends with" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  text: [
    { key: "contains", label: "contains" },
    { key: "not_contains", label: "doesn't contain" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  enum: [
    { key: "is", label: "is" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  boolean: [
    { key: "true", label: "is true", unary: true },
    { key: "false", label: "is false", unary: true },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  integer: [
    { key: "eq", label: "equals" },
    { key: "lt", label: "less than" },
    { key: "gt", label: "greater than" },
    { key: "between", label: "between" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  decimal: [
    { key: "eq", label: "equals" },
    { key: "lt", label: "less than" },
    { key: "gt", label: "greater than" },
    { key: "between", label: "between" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  float: [
    { key: "eq", label: "equals" },
    { key: "lt", label: "less than" },
    { key: "gt", label: "greater than" },
    { key: "between", label: "between" },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  date: [
    { key: "eq", label: "is" },
    { key: "lt", label: "before" },
    { key: "gt", label: "after" },
    { key: "between", label: "between" },
    { key: "today", label: "today", unary: true },
    { key: "yesterday", label: "yesterday", unary: true },
    { key: "this_week", label: "this week", unary: true },
    { key: "last_week", label: "last week", unary: true },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
  datetime: [
    { key: "eq", label: "is" },
    { key: "lt", label: "before" },
    { key: "gt", label: "after" },
    { key: "between", label: "between" },
    { key: "today", label: "today", unary: true },
    { key: "yesterday", label: "yesterday", unary: true },
    { key: "this_week", label: "this week", unary: true },
    { key: "last_week", label: "last week", unary: true },
    { key: "present", label: "is present", unary: true },
    { key: "blank", label: "is blank", unary: true },
  ],
};

export interface CascadeEntry {
  association: string;
  model: string | null;
  count: number;
  dependent: string;
  children?: CascadeEntry[];
}

export interface CascadeInfo {
  record: { display_name: string; model: string };
  cascades: CascadeEntry[];
  restrict: CascadeEntry[];
}

export interface Flash {
  success?: string;
  error?: string;
}

export interface CurrentUser {
  id: number | string;
  name: string;
  email?: string;
}

export interface SharedProps {
  models: ModelSummary[];
  current_model?: string;
  current_user?: CurrentUser;
  flash?: Flash;
  navigation?: { groups: NavigationGroup[] } | null;
  app_name?: string;
  app_version?: string | null;
  [key: string]: unknown;
}
