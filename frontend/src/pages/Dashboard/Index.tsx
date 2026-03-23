import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import {
  Database,
  Users,
  FileText,
  ShoppingCart,
  Tag,
  MessageSquare,
  Package,
  MapPin,
  Layers,
  BookOpen,
} from "lucide-react";

interface Model {
  name: string;
  count: number;
}

interface Props {
  models: Model[];
}

const MODEL_ICONS: Record<string, React.ElementType> = {
  User: Users,
  Post: FileText,
  Comment: MessageSquare,
  Category: Layers,
  Tag: Tag,
  Order: ShoppingCart,
  OrderItem: ShoppingCart,
  Product: Package,
  DigitalProduct: Package,
  PhysicalProduct: Package,
  Address: MapPin,
  Page: BookOpen,
};

function Dashboard({ models }: Props) {
  const totalRecords = models.reduce((sum, m) => sum + m.count, 0);

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => {
          const Icon = MODEL_ICONS[model.name] || Database;
          return (
            <Link
              key={model.name}
              href={`/new-admin/${model.name.toLowerCase()}`}
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
                <div className="rounded-md bg-muted p-2 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {model.count === 1 ? "1 record" : `${model.count} records`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

Dashboard.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default Dashboard;
