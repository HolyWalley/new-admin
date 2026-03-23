import Layout from "@/layouts/Layout";
import { Link, router } from "@inertiajs/react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ModelMeta, RecordData, AssociationData, ColumnDef } from "@/types";

interface Props {
  model: ModelMeta;
  record: RecordData;
  associations: AssociationData[];
}

function ResourceShow({ model, record, associations }: Props) {
  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    router.delete(`/new-admin/${model.param_key}/${record.id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {record.display_name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {model.name} #{String(record.id)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/new-admin/${model.param_key}/${record.id}/edit`}>
            <Button variant="outline">
              <Pencil />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {model.columns.map((col) => (
              <tr
                key={col.name}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/30 w-48 align-top">
                  {col.name}
                </td>
                <td className="px-4 py-3">
                  <FieldValue value={record[col.name]} column={col} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {associations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Associations
          </h3>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {associations.map((assoc) => (
                  <tr
                    key={assoc.name}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/30 w-48 align-top">
                      <div>{assoc.name}</div>
                      <div className="text-xs font-normal">{assoc.type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <AssociationValue assoc={assoc} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <Link href={`/new-admin/${model.param_key}`}>
          <Button variant="ghost">&larr; Back to {model.name} list</Button>
        </Link>
      </div>
    </div>
  );
}

function FieldValue({ value, column }: { value: unknown; column: ColumnDef }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic">null</span>;
  }

  if (column.type === "boolean") {
    return <Badge variant={value ? "default" : "muted"}>{value ? "true" : "false"}</Badge>;
  }

  if (column.type === "enum") {
    return <Badge variant="outline">{String(value)}</Badge>;
  }

  if (column.type === "datetime" || column.type === "date") {
    try {
      const date = new Date(String(value));
      return <span className="tabular-nums">{date.toLocaleString()}</span>;
    } catch {
      return <span>{String(value)}</span>;
    }
  }

  if (column.type === "text") {
    const str = String(value);
    return (
      <div className="max-w-prose whitespace-pre-wrap break-words">
        {str.length > 500 ? str.slice(0, 500) + "..." : str}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

function AssociationValue({ assoc }: { assoc: AssociationData }) {
  if (assoc.type === "belongs_to" || assoc.type === "has_one") {
    if (!assoc.record) {
      return <span className="text-muted-foreground/50 italic">none</span>;
    }
    return (
      <Link
        href={`/new-admin/${assoc.record.param_key}/${assoc.record.id}`}
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        {assoc.record.display_name}
        <ExternalLink className="h-3 w-3" />
      </Link>
    );
  }

  if (assoc.type === "has_many" || assoc.type === "has_many_through") {
    return (
      <Badge variant="muted">
        {assoc.count ?? 0} {(assoc.count ?? 0) === 1 ? "record" : "records"}
      </Badge>
    );
  }

  return <span className="text-muted-foreground/50">-</span>;
}

ResourceShow.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceShow;
