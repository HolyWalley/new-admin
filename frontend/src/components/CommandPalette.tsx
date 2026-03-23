import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Database, LayoutDashboard } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { SharedProps } from "@/types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { props } = usePage<SharedProps>();
  const models = props.models ?? [];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigate(path: string) {
    setOpen(false);
    router.visit(path);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search models..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigate("/new-admin")}>
              <LayoutDashboard className="h-4 w-4 opacity-60" />
              <span>Dashboard</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Models">
            {models.map((model) => (
              <CommandItem
                key={model.param_key}
                onSelect={() => navigate(`/new-admin/${model.param_key}`)}
              >
                <Database className="h-4 w-4 opacity-40" />
                <span className="flex-1">{model.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {model.count}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
