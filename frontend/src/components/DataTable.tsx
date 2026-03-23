import { router, Link } from "@inertiajs/react";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef, RecordData, SortState, AssociationDef, FilterRule, AttachmentInfo } from "@/types";
import { FileIcon } from "lucide-react";

interface BelongsToData {
  id: number;
  display_name: string;
  param_key: string;
}

interface DataTableProps {
  columns: ColumnDef[];
  records: RecordData[];
  sort: SortState;
  modelParamKey: string;
  associations?: AssociationDef[];
  attachmentAttributes?: Array<{ name: string; multiple: boolean }>;
  bulkSelectable?: boolean;
  selectedIds?: Set<number | string>;
  onSelectionChange?: (selectedIds: Set<number | string>) => void;
  search?: string;
  filters?: FilterRule[];
  onCellFilter?: (column: string, operator: string, value: string) => void;
}

export function serializeFilters(params: Record<string, string>, filters: FilterRule[]) {
  filters.forEach((rule, i) => {
    params[`f[${i}][c]`] = rule.column;
    params[`f[${i}][o]`] = rule.operator;
    if (rule.value) params[`f[${i}][v]`] = rule.value;
    if (rule.value2) params[`f[${i}][v2]`] = rule.value2;
  });
}

export function DataTable({
  columns, records, sort, modelParamKey, associations,
  attachmentAttributes,
  bulkSelectable, selectedIds, onSelectionChange,
  search, filters, onCellFilter,
}: DataTableProps) {
  const visibleColumns = columns.filter(
    (col) => !["text", "binary"].includes(col.type)
  );

  const hasManyAssocs = (associations ?? []).filter(
    (a) => a.type === "has_many" || a.type === "has_many_through"
  );

  // Map foreign key column names to their belongs_to association name
  // e.g. "category_id" -> "category", "author_id" -> "author"
  const fkMap = new Map<string, string>();
  (associations ?? []).forEach((assoc) => {
    if (assoc.type === "belongs_to" && assoc.foreign_key) {
      fkMap.set(assoc.foreign_key, assoc.name);
    }
  });

  // Resolve the correct link target for has_many associations.
  // For has_many_through, link to the join model with the source FK.
  function getAssocLink(assoc: AssociationDef): { paramKey: string; foreignKey: string } | null {
    if (assoc.type === "has_many_through" && assoc.through) {
      // Find the through (join) association and use its target + FK
      const throughAssoc = (associations ?? []).find((a) => a.name === assoc.through);
      if (throughAssoc?.target_model && throughAssoc.foreign_key) {
        return { paramKey: throughAssoc.target_model.toLowerCase(), foreignKey: throughAssoc.foreign_key };
      }
      return null;
    }
    if (assoc.type === "has_many" && assoc.foreign_key && assoc.target_model) {
      return { paramKey: assoc.target_model.toLowerCase(), foreignKey: assoc.foreign_key };
    }
    return null;
  }

  function getColumnLabel(col: ColumnDef): string {
    if (col.foreign_key && fkMap.has(col.name)) {
      return fkMap.get(col.name)!;
    }
    return col.name;
  }

  function buildParams(extra: Record<string, string> = {}): Record<string, string> {
    const params: Record<string, string> = { ...extra };
    if (search) params.q = search;
    if (filters && filters.length > 0) {
      serializeFilters(params, filters);
    }
    return params;
  }

  function handleSort(columnName: string) {
    const newDirection =
      sort.column === columnName && sort.direction === "desc" ? "asc" : "desc";
    router.get(
      `/new-admin/${modelParamKey}`,
      buildParams({ sort: columnName, direction: newDirection }),
      { preserveState: true, preserveScroll: true }
    );
  }

  function handleDelete(id: number | string) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    router.delete(`/new-admin/${modelParamKey}/${id}`);
  }

  function handleSelectAll(checked: boolean) {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(records.map((r) => r.id)));
    } else {
      onSelectionChange(new Set());
    }
  }

  function handleSelectRow(id: number | string, checked: boolean) {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    onSelectionChange(next);
  }

  const allSelected = bulkSelectable && selectedIds && records.length > 0 && records.every((r) => selectedIds.has(r.id));

  function SortIcon({ column }: { column: string }) {
    if (sort.column !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sort.direction === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
        No records found.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {bulkSelectable && (
                <th className="h-10 w-10 px-3">
                  <input
                    type="checkbox"
                    className="toggle h-4 w-4"
                    checked={!!allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.name}
                  className={`${col.name}_field h-10 px-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none`}
                  onClick={() => handleSort(col.name)}
                >
                  <span className="inline-flex items-center gap-1">
                    {getColumnLabel(col)}
                    <SortIcon column={col.name} />
                  </span>
                </th>
              ))}
              {(attachmentAttributes ?? []).map((att) => (
                <th
                  key={att.name}
                  className="h-10 px-3 text-left font-medium text-muted-foreground"
                >
                  {att.name}
                </th>
              ))}
              {hasManyAssocs.map((assoc) => (
                <th
                  key={assoc.name}
                  className={`${assoc.name}_field h-10 px-3 text-left font-medium text-muted-foreground`}
                >
                  {assoc.name}
                </th>
              ))}
              <th className="h-10 w-28 px-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={String(record.id)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                {bulkSelectable && (
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      name="bulk_ids[]"
                      value={String(record.id)}
                      checked={selectedIds?.has(record.id) ?? false}
                      onChange={(e) => handleSelectRow(record.id, e.target.checked)}
                      className="h-4 w-4"
                    />
                  </td>
                )}
                {visibleColumns.map((col) => {
                  // For foreign key columns, render as association link
                  const assocName = col.foreign_key ? fkMap.get(col.name) : undefined;
                  const belongsTo = assocName
                    ? (record[`_belongs_to_${assocName}`] as BelongsToData | undefined)
                    : undefined;

                  if (belongsTo) {
                    return (
                      <td key={col.name} className="px-3 py-2.5">
                        <Link
                          href={`/new-admin/${belongsTo.param_key}/${belongsTo.id}`}
                          className="text-primary hover:underline"
                        >
                          {belongsTo.display_name}
                        </Link>
                      </td>
                    );
                  }

                  return (
                    <td key={col.name} className="px-3 py-2.5">
                      <CellValue
                        value={record[col.name]}
                        column={col}
                        onFilter={onCellFilter}
                      />
                    </td>
                  );
                })}
                {(attachmentAttributes ?? []).map((att) => {
                  const info = record[`_attachment_${att.name}`] as AttachmentInfo | undefined;
                  return (
                    <td key={att.name} className="px-3 py-2.5">
                      {info?.thumbnail_url ? (
                        <img
                          src={info.thumbnail_url}
                          alt={info.filename}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : info ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <FileIcon className="h-3.5 w-3.5" />
                          {info.filename}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-xs">none</span>
                      )}
                    </td>
                  );
                })}
                {hasManyAssocs.map((assoc) => {
                  const link = getAssocLink(assoc);
                  const count = String(record[`_assoc_${assoc.name}`] ?? 0);
                  return (
                    <td key={assoc.name} className="px-3 py-2.5">
                      {link ? (
                        <Link
                          href={`/new-admin/${link.paramKey}?f[0][c]=${link.foreignKey}&f[0][o]=eq&f[0][v]=${String(record.id)}`}
                          className="hover:underline"
                        >
                          <Badge variant="muted">{count}</Badge>
                        </Link>
                      ) : (
                        <Badge variant="muted">{count}</Badge>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/new-admin/${modelParamKey}/${record.id}`}>
                      <Button variant="ghost" size="icon-sm" title="Show">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/new-admin/${modelParamKey}/${record.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Delete"
                      onClick={() => handleDelete(record.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellValue({
  value, column, onFilter,
}: {
  value: unknown;
  column: ColumnDef;
  onFilter?: (column: string, operator: string, value: string) => void;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic">null</span>;
  }

  if (column.type === "boolean") {
    const boolVal = !!value;
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onFilter?.(column.name, boolVal ? "true" : "false", ""); }}
        className="cursor-pointer hover:opacity-70 transition-opacity"
        title={`Filter: ${column.name} is ${boolVal}`}
      >
        {boolVal ? (
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground/50" />
        )}
      </button>
    );
  }

  if (column.type === "enum") {
    const strVal = String(value);
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onFilter?.(column.name, "is", strVal); }}
        className="cursor-pointer"
        title={`Filter: ${column.name} is ${strVal}`}
      >
        <Badge variant="outline" className="hover:bg-accent transition-colors">
          {strVal}
        </Badge>
      </button>
    );
  }

  if (column.type === "datetime" || column.type === "date") {
    try {
      const date = new Date(String(value));
      if (column.type === "date") {
        return <span>{date.toLocaleDateString()}</span>;
      }
      return (
        <span className="tabular-nums">
          {date.toLocaleDateString()}{" "}
          <span className="text-muted-foreground">
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </span>
      );
    } catch {
      return <span>{String(value)}</span>;
    }
  }

  if (column.type === "integer" || column.type === "decimal" || column.type === "float") {
    return <span className="tabular-nums">{String(value)}</span>;
  }

  const str = String(value);
  if (str.length > 60) {
    return <span title={str}>{str.slice(0, 60)}...</span>;
  }
  return <span>{str}</span>;
}
