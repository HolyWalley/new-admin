import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ResourceForm } from "@/components/ResourceForm";
import type { ModelMeta, AssociationOptions, HasManyThroughOptions, PolymorphicOptions, NestedFormConfigItem, NestedFormData } from "@/types";

interface Props {
  model: ModelMeta;
  record: Record<string, unknown>;
  association_options: AssociationOptions;
  has_many_through_options?: HasManyThroughOptions;
  polymorphic_options?: PolymorphicOptions;
  nested_form_config?: NestedFormConfigItem[];
  nested_form_data?: NestedFormData;
  errors: Record<string, string[]>;
}

function ResourceNew({ model, record, association_options, has_many_through_options, polymorphic_options, nested_form_config, nested_form_data, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          New {model.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new {model.name} record
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
        action="create"
      />

      <div>
        <Link href={`/new-admin/${model.param_key}`}>
          <Button variant="ghost">&larr; Back to {model.name} list</Button>
        </Link>
      </div>
    </div>
  );
}

ResourceNew.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceNew;
