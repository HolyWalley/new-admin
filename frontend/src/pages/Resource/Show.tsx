import { useState } from "react";
import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import type { ModelMeta, RecordData, AssociationData, ColumnDef, AttachmentInfo, Permissions, ServerActionConfig } from "@/types";
import { DefaultActionButton } from "@/components/DefaultActionButton";
import { FileIcon } from "lucide-react";

interface Props {
  model: ModelMeta;
  record: RecordData;
  associations: AssociationData[];
  view_columns?: ColumnDef[];
  permissions?: Permissions;
  actions?: ServerActionConfig[];
}

function ResourceShow({ model, record, associations, view_columns, permissions, actions }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Map foreign key column names to their belongs_to association
  const fkToAssoc = new Map<string, AssociationData>();
  associations.forEach((assoc) => {
    if (assoc.type === "belongs_to" && assoc.record) {
      // Find the matching FK column: association name + "_id" or use foreign_key from model associations
      const assocDef = model.associations.find((a) => a.name === assoc.name);
      if (assocDef?.foreign_key) {
        fkToAssoc.set(assocDef.foreign_key, assoc);
      }
    }
  });

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
          {(actions ?? []).map((action) => (
            <DefaultActionButton
              key={action.name}
              record={record}
              modelParamKey={model.param_key}
              modelName={model.name}
              actionConfig={action}
            />
          ))}
          {permissions?.update !== false && (
            <Link href={`/new-admin/${model.param_key}/${record.id}/edit`}>
              <Button variant="outline">
                <Pencil />
                Edit
              </Button>
            </Link>
          )}
          {permissions?.destroy !== false && (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {(view_columns ?? model.columns).map((col) => {
              // For FK columns, show the association link instead
              const assocData = fkToAssoc.get(col.name);
              return (
                <tr
                  key={col.name}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/30 w-48 align-top">
                    {col.label
                      ? col.label
                      : assocData
                        ? model.associations.find((a) => a.name === assocData.name)?.name ?? col.name
                        : col.name}
                  </td>
                  <td className="px-4 py-3">
                    {assocData && assocData.record ? (
                      <Link
                        href={`/new-admin/${assocData.record.param_key}/${assocData.record.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {assocData.record.display_name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <FieldValue value={record[col.name]} column={col} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {model.attachment_attributes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Attachments
          </h3>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {model.attachment_attributes.map((att) => {
                  const info = record[`_attachment_${att.name}`] as AttachmentInfo | undefined;
                  return (
                    <tr key={att.name} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/30 w-48 align-top">
                        {att.name}
                      </td>
                      <td className="px-4 py-3">
                        {info?.url && info.content_type?.startsWith("image/") ? (
                          <div className="space-y-2">
                            <img
                              src={info.url}
                              alt={info.filename}
                              className="max-h-64 rounded-md border border-border"
                            />
                            <p className="text-xs text-muted-foreground">{info.filename}</p>
                          </div>
                        ) : info ? (
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            {info.url ? (
                              <a href={info.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {info.filename}
                              </a>
                            ) : info.filename}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 italic">none</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {associations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Associations
          </h3>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {associations
                  .filter((a) => a.type !== "belongs_to")
                  .map((assoc) => (
                  <tr
                    key={assoc.name}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/30 w-48 align-top">
                      <div>{assoc.name}</div>
                      <div className="text-xs font-normal">{assoc.type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <AssociationValue assoc={assoc} recordId={record.id} />
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

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        modelParamKey={model.param_key}
        recordId={record.id}
        recordDisplayName={record.display_name}
        modelName={model.name}
      />
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

function AssociationValue({ assoc, recordId }: { assoc: AssociationData; recordId: number | string }) {
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
    const count = assoc.count ?? 0;
    const label = `${count} ${count === 1 ? "record" : "records"}`;

    // If we have param_key and foreign_key, make it a clickable link
    if (assoc.param_key && assoc.foreign_key) {
      return (
        <Link
          href={`/new-admin/${assoc.param_key}?f[0][c]=${assoc.foreign_key}&f[0][o]=eq&f[0][v]=${String(recordId)}`}
          className="hover:underline"
        >
          <Badge variant="muted">{label}</Badge>
        </Link>
      );
    }

    return <Badge variant="muted">{label}</Badge>;
  }

  return <span className="text-muted-foreground/50">-</span>;
}

ResourceShow.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceShow;
