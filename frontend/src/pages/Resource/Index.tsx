import { useState } from "react";
import Layout from "@/layouts/Layout";
import { Link, router } from "@inertiajs/react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, serializeFilters } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import type { ModelMeta, RecordData, PaginationMeta, SortState, FilterRule } from "@/types";

interface Props {
  model: ModelMeta;
  records: RecordData[];
  pagination: PaginationMeta;
  sort: SortState;
  search: string;
  filters: FilterRule[];
}

function ResourceIndex({ model, records, pagination, sort, search, filters }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected ${selectedIds.size === 1 ? "record" : "records"}?`)) return;
    router.delete(`/new-admin/${model.param_key}/bulk_destroy`, {
      data: { bulk_ids: Array.from(selectedIds) },
      onSuccess: () => setSelectedIds(new Set()),
    });
  }

  function handleFilterChange(newRules: FilterRule[]) {
    const params: Record<string, string> = {
      sort: sort.column,
      direction: sort.direction,
    };
    if (search) params.q = search;
    serializeFilters(params, newRules);
    router.get(`/new-admin/${model.param_key}`, params, {
      preserveState: true,
      preserveScroll: true,
    });
  }

  function handleCellFilter(column: string, operator: string, value: string) {
    // Check if this exact filter already exists
    const exists = filters.some(
      (f) => f.column === column && f.operator === operator && f.value === value
    );
    if (exists) return;
    handleFilterChange([...filters, { column, operator, value }]);
  }

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

      <div className="flex items-start gap-4">
        <SearchBar
          value={search}
          modelParamKey={model.param_key}
          sort={sort}
          filters={filters}
        />
      </div>

      <FilterPanel
        rules={filters}
        columns={model.columns}
        enums={model.enums}
        onChange={handleFilterChange}
      />

      <DataTable
        columns={model.columns}
        records={records}
        sort={sort}
        modelParamKey={model.param_key}
        associations={model.associations}
        attachmentAttributes={model.attachment_attributes}
        bulkSelectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        search={search}
        filters={filters}
        onCellFilter={handleCellFilter}
      />

      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
          </span>
          <a
            className="bulk-link inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground cursor-pointer hover:bg-destructive/90 transition-colors"
            data-action="bulk_delete"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </a>
        </div>
      )}

      <Pagination
        pagination={pagination}
        modelParamKey={model.param_key}
        sort={sort}
        search={search}
        filters={filters}
      />
    </div>
  );
}

ResourceIndex.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default ResourceIndex;
