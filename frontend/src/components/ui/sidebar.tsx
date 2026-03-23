import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------- Context ---------- */

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  open: true,
  setOpen: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

/* ---------- Provider ---------- */

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-svh w-full bg-background">{children}</div>
    </SidebarContext.Provider>
  );
}

/* ---------- Sidebar root ---------- */

export function Sidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground",
        className
      )}
    >
      {children}
    </aside>
  );
}

/* ---------- Sidebar sections ---------- */

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 border-b border-sidebar-border px-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={cn("flex-1 overflow-y-auto py-3 px-2", className)}>
      {children}
    </nav>
  );
}

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-t border-sidebar-border px-3 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Groups ---------- */

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Menu ---------- */

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn("flex flex-col gap-px", className)}>{children}</ul>;
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={cn(className)}>{children}</li>;
}

/* ---------- Menu item link classes ---------- */

export function sidebarMenuLinkClass(isActive?: boolean) {
  return cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
  );
}

/* ---------- Main content area ---------- */

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      {children}
    </main>
  );
}
