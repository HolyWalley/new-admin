import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import type { ModelMeta, RecordData, PaginationMeta, SortState } from "@/types";

interface Props {
  model: ModelMeta;
  records: RecordData[];
  pagination: PaginationMeta;
  sort: SortState;
}

function ResourceIndex({ model, records, pagination, sort }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {model.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "record" : "records"}
          </p>
        </div>
        <Link href={`/new-admin/${model.param_key}/new`}>
          <Button>
            <Plus />
            Add new
          </Button>
        </Link>
      </div>

      <DataTable
        columns={model.columns}
        records={records}
        sort={sort}
        modelParamKey={model.param_key}
      />

      <Pagination
        pagination={pagination}
        modelParamKey={model.param_key}
        sort={sort}
      />
    </div>
  );
}

ResourceIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceIndex;
