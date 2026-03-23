import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ResourceForm } from "@/components/ResourceForm";
import type { ModelMeta, RecordData, AssociationOptions } from "@/types";

interface Props {
  model: ModelMeta;
  record: RecordData;
  association_options: AssociationOptions;
  errors: Record<string, string[]>;
}

function ResourceEdit({ model, record, association_options, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit {model.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Editing {record.display_name} (#{String(record.id)})
        </p>
      </div>

      <ResourceForm
        model={model}
        record={record}
        associationOptions={association_options}
        errors={errors}
        action="update"
      />

      <div>
        <Link href={`/new-admin/${model.param_key}`}>
          <Button variant="ghost">&larr; Back to {model.name} list</Button>
        </Link>
      </div>
    </div>
  );
}

ResourceEdit.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceEdit;
