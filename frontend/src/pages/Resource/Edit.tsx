import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ResourceForm } from "@/components/ResourceForm";
import type { ModelMeta, RecordData, AssociationOptions, HasManyThroughOptions, PolymorphicOptions, NestedFormConfigItem, NestedFormData, ColumnDef } from "@/types";

interface Props {
  model: ModelMeta;
  record: RecordData;
  association_options: AssociationOptions;
  has_many_through_options?: HasManyThroughOptions;
  polymorphic_options?: PolymorphicOptions;
  nested_form_config?: NestedFormConfigItem[];
  nested_form_data?: NestedFormData;
  errors: Record<string, string[]>;
  view_columns?: ColumnDef[];
}

function ResourceEdit({ model, record, association_options, has_many_through_options, polymorphic_options, nested_form_config, nested_form_data, errors, view_columns }: Props) {
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
        hasManyThroughOptions={has_many_through_options}
        polymorphicOptions={polymorphic_options}
        nestedFormConfig={nested_form_config}
        nestedFormData={nested_form_data}
        errors={errors}
        action="update"
        viewColumns={view_columns}
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
