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
}

export interface AssociationDef {
  name: string;
  type: "belongs_to" | "has_many" | "has_many_through" | "has_one";
  target_model: string | null;
  foreign_key?: string;
  polymorphic?: boolean;
  through?: string;
  nested_attributes?: boolean;
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

export interface ModelSummary {
  name: string;
  param_key: string;
  count: number;
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
}

export type AssociationOptions = Record<
  string,
  Array<{ id: number; label: string }>
>;

export interface Flash {
  success?: string;
  error?: string;
}

export interface SharedProps {
  models: ModelSummary[];
  current_model?: string;
  flash?: Flash;
  [key: string]: unknown;
}
