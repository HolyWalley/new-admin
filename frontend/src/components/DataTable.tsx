import { router, Link } from "@inertiajs/react";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef, RecordData, SortState } from "@/types";

interface DataTableProps {
  columns: ColumnDef[];
  records: RecordData[];
  sort: SortState;
  modelParamKey: string;
}

export function DataTable({ columns, records, sort, modelParamKey }: DataTableProps) {
  const visibleColumns = columns.filter(
    (col) => !["text", "binary"].includes(col.type)
  );

  function handleSort(columnName: string) {
    const newDirection =
      sort.column === columnName && sort.direction === "desc" ? "asc" : "desc";
    router.get(
      `/new-admin/${modelParamKey}`,
      { sort: columnName, direction: newDirection },
      { preserveState: true, preserveScroll: true }
    );
  }

  function handleDelete(id: number | string) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    router.delete(`/new-admin/${modelParamKey}/${id}`);
  }

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {visibleColumns.map((col) => (
                <th
                  key={col.name}
                  className="h-10 px-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort(col.name)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.name}
                    <SortIcon column={col.name} />
                  </span>
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
                {visibleColumns.map((col) => (
                  <td key={col.name} className="px-3 py-2.5">
                    <CellValue value={record[col.name]} column={col} />
                  </td>
                ))}
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

function CellValue({ value, column }: { value: unknown; column: ColumnDef }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic">null</span>;
  }

  if (column.type === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/50" />
    );
  }

  if (column.type === "enum") {
    return <Badge variant="outline">{String(value)}</Badge>;
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
