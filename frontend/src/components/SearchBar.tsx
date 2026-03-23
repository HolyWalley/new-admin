import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import type { SortState, FilterValues } from "@/types";

interface SearchBarProps {
  value: string;
  modelParamKey: string;
  sort: SortState;
  filters: FilterValues;
}

export function SearchBar({ value, modelParamKey, sort, filters }: SearchBarProps) {
  const [query, setQuery] = useState(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(query);
  }

  function handleClear() {
    setQuery("");
    navigate("");
  }

  function navigate(q: string) {
    const params: Record<string, string> = {
      sort: sort.column,
      direction: sort.direction,
    };
    if (q) params.q = q;
    // Preserve filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[`f[${key}]`] = val;
    });
    // Reset to page 1 on search change
    router.get(`/new-admin/${modelParamKey}`, params, {
      preserveState: true,
      preserveScroll: true,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {query && (
          <button
            type="button"
            data-action="clear-search"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
