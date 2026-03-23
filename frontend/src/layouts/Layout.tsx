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
  Database,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import type { SharedProps } from "@/types";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { props, url } = usePage<SharedProps>();
  const models = props.models ?? [];
  const currentModel = props.current_model;
  const currentUser = props.current_user;
  const flash = props.flash;
  const isDashboard = url === "/new-admin" || url === "/new-admin/";

  return (
    <SidebarProvider>
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

          <SidebarGroup>
            <SidebarGroupLabel>Models</SidebarGroupLabel>
            <SidebarMenu>
              {models.map((model) => (
                <SidebarMenuItem key={model.name}>
                  <SidebarNavLink
                    href={`/new-admin/${model.param_key}`}
                    isActive={currentModel === model.name}
                  >
                    <Database className="h-4 w-4 shrink-0 opacity-40" />
                    <SidebarLabel className="flex-1 truncate">{model.name}</SidebarLabel>
                    <SidebarLabel className="text-[11px] tabular-nums text-sidebar-foreground/40">
                      {model.count}
                    </SidebarLabel>
                  </SidebarNavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
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
        <FlashMessages flash={flash} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
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

function SidebarNavLink({ href, isActive, children }: { href: string; isActive?: boolean; children: React.ReactNode }) {
  const { open, setMobileOpen } = useSidebar();
  return (
    <Link
      href={href}
      className={sidebarMenuLinkClass(isActive)}
      title={!open ? String((children as React.ReactNode[])?.[1] ?? "") : undefined}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
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
