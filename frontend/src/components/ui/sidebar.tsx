import * as React from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, Menu } from "lucide-react";

/* ---------- Context ---------- */

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  open: true,
  setOpen: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

/* ---------- Provider ---------- */

const STORAGE_KEY = "new-admin-sidebar";

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpenState] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : defaultOpen;
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setOpen = React.useCallback((value: boolean) => {
    setOpenState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, mobileOpen, setMobileOpen }}>
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
  const { open, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out overflow-hidden",
          open ? "w-64" : "w-12",
          className
        )}
      >
        {children}
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-64 p-0 bg-sidebar text-sidebar-foreground">
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ---------- Sidebar trigger (toggle button) ---------- */

export function SidebarTrigger({ className }: { className?: string }) {
  const { open, setOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(!open)}
        className={cn("hidden md:inline-flex", className)}
        title={open ? "Collapse sidebar (⌘B)" : "Expand sidebar (⌘B)"}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setMobileOpen(true)}
        className={cn("md:hidden", className)}
        title="Open menu"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
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
  const { open } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 border-b border-sidebar-border px-4 shrink-0",
        !open && "justify-center px-2",
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
        "border-t border-sidebar-border px-3 py-3 shrink-0",
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
  const { open } = useSidebar();
  if (!open) return null;
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
