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
  Users,
  MapPin,
  FolderTree,
  MessageSquare,
  ShoppingCart,
  Package,
  FileText,
  PenLine,
  Box,
  Monitor,
  Truck,
  Tag,
  Tags,
  Notebook,
  StickyNote,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { CommandPalette } from "@/components/CommandPalette";
import type { SharedProps, ModelSummary } from "@/types";

/* ───── Semantic icon per model (deterministic color from name) ───── */

const MODEL_COLORS: [string, string][] = [
  ["text-red-500", "bg-red-500"], ["text-orange-500", "bg-orange-500"],
  ["text-amber-500", "bg-amber-500"], ["text-yellow-500", "bg-yellow-500"],
  ["text-lime-500", "bg-lime-500"], ["text-green-500", "bg-green-500"],
  ["text-emerald-500", "bg-emerald-500"], ["text-teal-500", "bg-teal-500"],
  ["text-cyan-500", "bg-cyan-500"], ["text-sky-500", "bg-sky-500"],
  ["text-blue-500", "bg-blue-500"], ["text-indigo-500", "bg-indigo-500"],
  ["text-violet-500", "bg-violet-500"], ["text-purple-500", "bg-purple-500"],
  ["text-fuchsia-500", "bg-fuchsia-500"], ["text-pink-500", "bg-pink-500"],
  ["text-rose-500", "bg-rose-500"],
];

/** Pattern → icon mapping. First match wins. Patterns match against lowercase model name. */
const ICON_PATTERNS: [RegExp, LucideIcon][] = [
  [/user|account|member|person|people|admin|employee|staff|author/i, Users],
  [/address|location|place|geo/i, MapPin],
  [/category|categor|folder|group|section/i, FolderTree],
  [/comment|review|feedback|reply|response/i, MessageSquare],
  [/order_item|line_item|cart_item|basket_item/i, Package],
  [/order|purchase|checkout|transaction|sale/i, ShoppingCart],
  [/digital.?product|download|ebook|software/i, Monitor],
  [/physical.?product|shipped|tangible/i, Truck],
  [/product|item|good|merchandise|sku/i, Box],
  [/page|document|wiki|article/i, FileText],
  [/post|blog|entry|story|publication/i, PenLine],
  [/tagging|categoriz/i, Tags],
  [/tag|label|keyword/i, Tag],
  [/note$/i, StickyNote],
  [/notes$/i, Notebook],
  [/attachment|file|upload|media|asset/i, Paperclip],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getModelIcon(name: string): LucideIcon | null {
  // Strip namespace for matching (e.g. "Notes::Attachment" → "Attachment")
  const simpleName = name.includes("::") ? name.split("::").pop()! : name;
  // Also try the full name for namespace-aware patterns
  for (const [pattern, icon] of ICON_PATTERNS) {
    if (pattern.test(simpleName) || pattern.test(name)) return icon;
  }
  return null; // no match — will show colored dot fallback
}

function ModelIcon({ name }: { name: string }) {
  const [textColor, bgColor] = MODEL_COLORS[hashString(name) % MODEL_COLORS.length];
  const Icon = getModelIcon(name);
  if (Icon) return <Icon className={`h-4 w-4 shrink-0 ${textColor}`} />;
  // Colored dot fallback — wrapped in icon-sized container for alignment
  return (
    <span className="h-4 w-4 shrink-0 flex items-center justify-center">
      <span className={`h-2.5 w-2.5 rounded-full ${bgColor}`} />
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { props, url } = usePage<SharedProps>();
  const models = props.models ?? [];
  const currentModel = props.current_model;
  const currentUser = props.current_user;
  const flash = props.flash;
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

          <ModelNavigation models={models} currentModel={currentModel} />
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

  // Insert STI groups at alphabetical position among entries
  for (const stiGroup of stiGroupMap.values()) {
    entries.push(stiGroup);
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

function ModelNavigation({ models, currentModel }: { models: ModelSummary[]; currentModel?: string }) {
  const entries = buildNavEntries(models);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Models</SidebarGroupLabel>
      <SidebarMenu>
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
          // Regular model
          const model = entry as ModelSummary;
          return (
            <SidebarMenuItem key={model.name}>
              <SidebarNavLink
                href={`/new-admin/${model.param_key}`}
                isActive={currentModel === model.name}
              >
                <ModelIcon name={model.name} />
                <SidebarLabel className="flex-1 truncate">{model.name}</SidebarLabel>
                <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
                  {model.count}
                </SidebarLabel>
              </SidebarNavLink>
            </SidebarMenuItem>
          );
        })}
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
          <ModelIcon name={parent.name} />
          <SidebarLabel className="flex-1 truncate">{parent.name}</SidebarLabel>
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
                <SidebarLabel className="flex-1 truncate">{model.name}</SidebarLabel>
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
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={sidebarMenuLinkClass(false)}
      >
        <ModelIcon name={label} />
        {sidebarOpen && (
          <>
            <span className="flex-1 truncate">{label}</span>
            <ChevronRight className={`h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </>
        )}
      </button>
      {expanded && sidebarOpen && (
        <ul className="ml-4 mt-0.5 flex flex-col gap-px border-l border-sidebar-border pl-2">
          {models.map((model) => (
            <SidebarMenuItem key={model.name}>
              <SidebarNavLink
                href={`/new-admin/${model.param_key}`}
                isActive={currentModel === model.name}
              >
                <SidebarLabel className="flex-1 truncate">
                  {model.name.replace(`${label}::`, "")}
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
                <div className="text-sm font-semibold leading-tight">NewAdmin</div>
                <div className="text-[11px] font-normal text-sidebar-foreground/50 leading-tight">v0.1.0</div>
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
