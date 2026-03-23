import { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuLinkClass,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  FileText,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { CommandPalette } from "@/components/CommandPalette";
import { ModelIcon } from "@/components/ModelIcon";
import { getAllPages } from "@/lib/registry";
import type { SharedProps, ModelSummary } from "@/types";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { props, url } = usePage<SharedProps>();
  const models = props.models ?? [];
  const currentModel = props.current_model;
  const currentUser = props.current_user;
  const flash = props.flash;
  const navigation = props.navigation;
  const isDashboard = url === "/new-admin" || url === "/new-admin/";

  // Show flash messages as toasts
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash?.success, flash?.error]);

  return (
    <SidebarProvider>
      <Toaster position="bottom-right" richColors closeButton />
      <CommandPalette />
      <Sidebar>
        <SidebarHeaderMenu isDashboard={isDashboard} />
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarNavLink href="/new-admin" isActive={isDashboard}>
                  <LayoutDashboard className="h-4 w-4 shrink-0 opacity-60" />
                  <SidebarLabel>Dashboard</SidebarLabel>
                </SidebarNavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <ModelNavigation models={models} currentModel={currentModel} navigation={navigation} />
        </SidebarContent>

        <SidebarFooterUser currentUser={currentUser} />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-6">
          <SidebarTrigger />
          <Breadcrumbs currentModel={currentModel} isDashboard={isDashboard} />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** Wrapper that hides children when sidebar is collapsed (desktop) */
function SidebarLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();
  if (!open) return null;
  return <span className={className}>{children}</span>;
}

/* ───── Model Navigation: Groups STI + namespaced models ───── */

/** Separate models into: ungrouped flat list, STI groups (parent + children), namespace groups */
interface StiGroup {
  type: "sti";
  parent: ModelSummary;
  children: ModelSummary[];
}

interface NamespaceGroup {
  type: "namespace";
  label: string;
  models: ModelSummary[];
}

type NavEntry = ModelSummary | StiGroup | NamespaceGroup;

function buildNavEntries(models: ModelSummary[]): NavEntry[] {
  const entries: NavEntry[] = [];
  const stiGroupMap = new Map<string, StiGroup>();
  const nsGroupMap = new Map<string, NamespaceGroup>();

  // First pass: find STI base classes and create groups
  for (const model of models) {
    if (model.sti_base) {
      stiGroupMap.set(model.name, { type: "sti", parent: model, children: [] });
    }
  }

  // Second pass: categorize all models
  for (const model of models) {
    if (model.sti_base) continue; // handled above as group parent

    const group = model.navigation_group;
    if (group && stiGroupMap.has(group)) {
      // STI child — add to parent's group
      stiGroupMap.get(group)!.children.push(model);
    } else if (group && group.includes("::") || (model.name.includes("::") && group)) {
      // Namespace group
      if (!nsGroupMap.has(group)) {
        nsGroupMap.set(group, { type: "namespace", label: group, models: [] });
      }
      nsGroupMap.get(group)!.models.push(model);
    } else {
      // Ungrouped
      entries.push(model);
    }
  }

  // Insert STI groups — namespaced ones go into their namespace group
  for (const stiGroup of stiGroupMap.values()) {
    const parentNs = stiGroup.parent.navigation_group;
    if (parentNs && parentNs.includes("::")) {
      if (!nsGroupMap.has(parentNs)) {
        nsGroupMap.set(parentNs, { type: "namespace", label: parentNs, models: [] });
      }
      // Add the STI parent + children as flat models inside the namespace group
      nsGroupMap.get(parentNs)!.models.push(stiGroup.parent, ...stiGroup.children);
    } else {
      entries.push(stiGroup);
    }
  }

  // Insert namespace groups
  for (const nsGroup of nsGroupMap.values()) {
    entries.push(nsGroup);
  }

  // Sort by display name
  entries.sort((a, b) => {
    const nameA = "type" in a ? (a.type === "sti" ? a.parent.name : a.label) : a.name;
    const nameB = "type" in b ? (b.type === "sti" ? b.parent.name : b.label) : b.name;
    return nameA.localeCompare(nameB);
  });

  return entries;
}

/** Strip namespace prefix, returning just the last segment of a :: delimited name */
function demodulize(name: string): string {
  const parts = name.split("::");
  return parts[parts.length - 1];
}

function sortByWeight(models: ModelSummary[]): ModelSummary[] {
  return [...models].sort((a, b) => {
    const wa = a.weight ?? 0;
    const wb = b.weight ?? 0;
    if (wa !== wb) return wa - wb;
    return a.name.localeCompare(b.name);
  });
}

function ModelItem({ model, currentModel }: { model: ModelSummary; currentModel?: string }) {
  return (
    <SidebarMenuItem key={model.name}>
      <SidebarNavLink
        href={`/new-admin/${model.param_key}`}
        isActive={currentModel === model.name}
      >
        <ModelIcon name={model.name} iconOverride={model.icon} />
        <SidebarLabel className="flex-1 truncate">{model.name}</SidebarLabel>
        <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
          {model.count}
        </SidebarLabel>
      </SidebarNavLink>
    </SidebarMenuItem>
  );
}

/** Render a list of NavEntry items (flat models, STI groups, namespace groups) */
function NavEntryList({ entries, currentModel }: { entries: NavEntry[]; currentModel?: string }) {
  return (
    <>
      {entries.map((entry) => {
        if ("type" in entry && entry.type === "sti") {
          return (
            <CollapsibleModelGroup
              key={entry.parent.name}
              parent={entry.parent}
              children={entry.children}
              currentModel={currentModel}
            />
          );
        }
        if ("type" in entry && entry.type === "namespace") {
          return (
            <CollapsibleNamespaceGroup
              key={entry.label}
              label={entry.label}
              models={entry.models}
              currentModel={currentModel}
            />
          );
        }
        const model = entry as ModelSummary;
        return <ModelItem key={model.name} model={model} currentModel={currentModel} />;
      })}
    </>
  );
}

function ModelNavigation({ models, currentModel, navigation }: { models: ModelSummary[]; currentModel?: string; navigation?: SharedProps["navigation"] }) {
  // When navigation groups are configured, render grouped sections
  if (navigation?.groups && navigation.groups.length > 0) {
    const modelMap = new Map(models.map((m) => [m.name, m]));
    const assigned = new Set<string>();

    const groups = navigation.groups.map((group) => {
      const groupModels = group.models
        .map((name) => modelMap.get(name))
        .filter((m): m is ModelSummary => !!m);
      groupModels.forEach((m) => assigned.add(m.name));
      return { label: group.label, entries: buildNavEntries(sortByWeight(groupModels)) };
    });

    // Collect unassigned models into "Other"
    const unassigned = sortByWeight(models.filter((m) => !assigned.has(m.name)));
    const unassignedEntries = buildNavEntries(unassigned);

    return (
      <>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              <NavEntryList entries={group.entries} currentModel={currentModel} />
            </SidebarMenu>
          </SidebarGroup>
        ))}
        {unassignedEntries.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarMenu>
              <NavEntryList entries={unassignedEntries} currentModel={currentModel} />
            </SidebarMenu>
          </SidebarGroup>
        )}
      </>
    );
  }

  // Default: auto-group by STI + namespace
  const entries = buildNavEntries(models);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Models</SidebarGroupLabel>
      <SidebarMenu>
        <NavEntryList entries={entries} currentModel={currentModel} />
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** Collapsible STI group: parent is a clickable link + chevron expands children */
function CollapsibleModelGroup({
  parent,
  children,
  currentModel,
}: {
  parent: ModelSummary;
  children: ModelSummary[];
  currentModel?: string;
}) {
  const { open: sidebarOpen } = useSidebar();
  const [expanded, setExpanded] = useState(true);

  return (
    <SidebarMenuItem>
      <div className="flex items-center">
        <SidebarNavLink
          href={`/new-admin/${parent.param_key}`}
          isActive={currentModel === parent.name}
          className="flex-1"
        >
          <ModelIcon name={parent.name} iconOverride={parent.icon} />
          <SidebarLabel className="flex-1 truncate">{demodulize(parent.name)}</SidebarLabel>
          <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
            {parent.count}
          </SidebarLabel>
        </SidebarNavLink>
        {sidebarOpen && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {expanded && sidebarOpen && (
        <ul className="ml-4 mt-0.5 flex flex-col gap-px border-l border-sidebar-border pl-2">
          {children.map((model) => (
            <SidebarMenuItem key={model.name}>
              <SidebarNavLink
                href={`/new-admin/${model.param_key}`}
                isActive={currentModel === model.name}
              >
                <SidebarLabel className="flex-1 truncate">{demodulize(model.name)}</SidebarLabel>
                <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
                  {model.count}
                </SidebarLabel>
              </SidebarNavLink>
            </SidebarMenuItem>
          ))}
        </ul>
      )}
    </SidebarMenuItem>
  );
}

/** Collapsible namespace group: label header + expand to show models */
function CollapsibleNamespaceGroup({
  label,
  models,
  currentModel,
}: {
  label: string;
  models: ModelSummary[];
  currentModel?: string;
}) {
  const { open: sidebarOpen } = useSidebar();
  const [expanded, setExpanded] = useState(true);

  return (
    <SidebarMenuItem>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`${sidebarMenuLinkClass(false)} flex-1 text-left`}
        >
          <ModelIcon name={label} />
          <SidebarLabel className="flex-1 truncate">{label}</SidebarLabel>
        </button>
        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {expanded && sidebarOpen && (
        <ul className="ml-4 mt-0.5 flex flex-col gap-px border-l border-sidebar-border pl-2">
          {models.map((model) => (
            <SidebarMenuItem key={model.name}>
              <SidebarNavLink
                href={`/new-admin/${model.param_key}`}
                isActive={currentModel === model.name}
              >
                <SidebarLabel className="flex-1 truncate">
                  {demodulize(model.name)}
                </SidebarLabel>
                <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
                  {model.count}
                </SidebarLabel>
              </SidebarNavLink>
            </SidebarMenuItem>
          ))}
        </ul>
      )}
    </SidebarMenuItem>
  );
}

/* ───── Sidebar Header: App menu dropdown ───── */

function SidebarHeaderMenu({ isDashboard }: { isDashboard: boolean }) {
  const { open } = useSidebar();
  const { props: sharedProps } = usePage<SharedProps>();
  const pages = Object.entries(getAllPages());

  return (
    <SidebarHeader>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className={`flex w-full items-center gap-2 rounded-md text-left text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${open ? "px-1 py-0.5" : "justify-center"}`} />
          }
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent shrink-0">
            <LayoutDashboard className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {open && (
            <>
              <div className="flex-1 truncate">
                <div className="text-sm font-semibold leading-tight">{sharedProps.app_name || "NewAdmin"}</div>
                {sharedProps.app_version && <div className="text-[11px] font-normal text-sidebar-foreground/50 leading-tight">{sharedProps.app_version}</div>}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/40 shrink-0" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" sideOffset={6}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuItem
              render={<Link href="/new-admin" />}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
              {isDashboard && (
                <span className="ml-auto text-[10px] text-muted-foreground">current</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {pages.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Pages</DropdownMenuLabel>
                {pages.map(([path, entry]) => (
                  <DropdownMenuItem
                    key={path}
                    render={<Link href={`/new-admin/pages/${path}`} />}
                  >
                    <FileText className="h-4 w-4" />
                    {entry.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarHeader>
  );
}

/* ───── Sidebar Footer: User panel with dropdown ───── */

function SidebarFooterUser({ currentUser }: { currentUser?: SharedProps["current_user"] }) {
  const { open } = useSidebar();

  const userName = currentUser?.name ?? "Admin";
  const userEmail = currentUser?.email;
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className={`flex w-full items-center gap-2 rounded-md text-left text-sm hover:bg-sidebar-accent transition-colors ${open ? "px-1 py-1" : "justify-center"}`} />
          }
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground shrink-0">
            {initials}
          </div>
          {open && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight truncate">{userName}</div>
                {userEmail && (
                  <div className="text-[11px] text-sidebar-foreground/50 leading-tight truncate">{userEmail}</div>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/40 shrink-0" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" sideOffset={6}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex items-center gap-2 py-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{userName}</div>
                  {userEmail && <div className="text-xs font-normal text-muted-foreground truncate">{userEmail}</div>}
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.delete("/users/sign_out")}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

function SidebarNavLink({ href, isActive, children, className }: { href: string; isActive?: boolean; children: React.ReactNode; className?: string }) {
  const { open, setMobileOpen } = useSidebar();
  return (
    <Link
      href={href}
      className={`${sidebarMenuLinkClass(isActive)} ${className ?? ""}`}
      title={!open ? String((children as React.ReactNode[])?.[1] ?? "") : undefined}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  );
}

function Breadcrumbs({
  currentModel,
  isDashboard,
}: {
  currentModel?: string;
  isDashboard: boolean;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        href="/new-admin"
        className={
          isDashboard
            ? "font-medium text-foreground"
            : "hover:text-foreground transition-colors"
        }
      >
        Dashboard
      </Link>
      {currentModel && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{currentModel}</span>
        </>
      )}
    </nav>
  );
}
