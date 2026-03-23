import { router } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta, SortState } from "@/types";

interface PaginationProps {
  pagination: PaginationMeta;
  modelParamKey: string;
  sort: SortState;
}

export function Pagination({ pagination, modelParamKey, sort }: PaginationProps) {
  const { page, per_page, total, total_pages } = pagination;

  if (total_pages <= 1) return null;

  const from = (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  function goToPage(p: number) {
    router.get(
      `/new-admin/${modelParamKey}`,
      { page: p, sort: sort.column, direction: sort.direction },
      { preserveState: true, preserveScroll: true }
    );
  }

  const pages = getPageNumbers(page, total_pages);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => goToPage(p as number)}
              className="text-xs"
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= total_pages}
          onClick={() => goToPage(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
