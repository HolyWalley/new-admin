import Layout from "@/layouts/Layout";
import { Link, usePage } from "@inertiajs/react";
import { ModelIcon } from "@/components/ModelIcon";
import type { ModelSummary, SharedProps } from "@/types";

interface Props {
  models: ModelSummary[];
}

function ModelCard({ model }: { model: ModelSummary }) {
  return (
    <Link
      key={model.name}
      href={`/new-admin/${model.param_key}`}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm dark:hover:border-border/60"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {model.name}
          </p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {model.count.toLocaleString()}
          </p>
        </div>
        <div className="rounded-md bg-muted p-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ModelIcon name={model.name} iconOverride={model.icon} />
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {model.count === 1 ? "1 record" : `${model.count} records`}
      </div>
    </Link>
  );
}

function Dashboard({ models }: Props) {
  const { props } = usePage<SharedProps>();
  const navigation = props.navigation;
  const totalRecords = models.reduce((sum, m) => sum + m.count, 0);

  // Build grouped sections when navigation config present
  const sections = (() => {
    if (!navigation?.groups || navigation.groups.length === 0) {
      return [{ label: null, models }];
    }
    const modelMap = new Map(models.map((m) => [m.name, m]));
    const assigned = new Set<string>();
    const groups = navigation.groups.map((group) => {
      const groupModels = group.models
        .map((name) => modelMap.get(name))
        .filter((m): m is ModelSummary => !!m);
      groupModels.forEach((m) => assigned.add(m.name));
      return { label: group.label as string | null, models: groupModels };
    });
    const unassigned = models.filter((m) => !assigned.has(m.name));
    if (unassigned.length > 0) {
      groups.push({ label: "Other", models: unassigned });
    }
    return groups;
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {models.length} models, {totalRecords} total records
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.label ?? "_all"} className="space-y-3">
          {section.label && (
            <h3 className="text-sm font-medium text-muted-foreground">{section.label}</h3>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {section.models.map((model) => (
              <ModelCard key={model.name} model={model} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Dashboard.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default Dashboard;
