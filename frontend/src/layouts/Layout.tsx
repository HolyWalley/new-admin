import { Link, usePage } from "@inertiajs/react";
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
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, Database, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import type { SharedProps } from "@/types";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { props, url } = usePage<SharedProps>();
  const models = props.models ?? [];
  const currentModel = props.current_model;
  const flash = props.flash;
  const isDashboard = url === "/new-admin" || url === "/new-admin/";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/new-admin"
            className="flex items-center gap-2.5 font-semibold text-sidebar-primary"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-sm tracking-tight">NewAdmin</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link
                  href="/new-admin"
                  className={sidebarMenuLinkClass(isDashboard)}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0 opacity-60" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Models</SidebarGroupLabel>
            <SidebarMenu>
              {models.map((model) => (
                <SidebarMenuItem key={model.name}>
                  <Link
                    href={`/new-admin/${model.param_key}`}
                    className={sidebarMenuLinkClass(
                      currentModel === model.name
                    )}
                  >
                    <Database className="h-4 w-4 shrink-0 opacity-40" />
                    <span className="flex-1 truncate">{model.name}</span>
                    <span className="text-[11px] tabular-nums text-sidebar-foreground/40">
                      {model.count}
                    </span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sidebar-foreground/40">
              v0.1.0
            </span>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-6">
          <Breadcrumbs currentModel={currentModel} isDashboard={isDashboard} />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <FlashMessages flash={flash} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function FlashMessages({ flash }: { flash?: SharedProps["flash"] }) {
  if (!flash?.success && !flash?.error) return null;
  return (
    <div className="px-6 pt-4 space-y-2">
      {flash.success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {flash.success}
        </div>
      )}
      {flash.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {flash.error}
        </div>
      )}
    </div>
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
