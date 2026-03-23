import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { getPage } from "@/lib/registry";

interface Props {
  path: string;
}

function CustomPage({ path }: Props) {
  const entry = getPage(path);

  if (!entry) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No custom page registered for path: <code className="rounded bg-muted px-1.5 py-0.5">{path}</code>
          </p>
        </div>
        <div>
          <Link href="/new-admin">
            <Button variant="ghost">&larr; Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const PageComponent = entry.component;
  return <PageComponent />;
}

CustomPage.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default CustomPage;
