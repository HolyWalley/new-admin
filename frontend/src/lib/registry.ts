import type { CustomFieldProps, CustomActionConfig } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldComponent = React.ComponentType<CustomFieldProps>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageComponent = React.ComponentType<any>;

export interface PageEntry {
  component: PageComponent;
  label: string;
}

interface Registry {
  fields: Record<string, FieldComponent>;
  actions: Record<string, CustomActionConfig>;
  pages: Record<string, PageEntry>;
}

declare global {
  interface Window {
    __newAdminRegistry__?: Registry;
    React?: typeof import("react");
    __jsxRuntime__?: typeof import("react/jsx-runtime");
    NewAdmin?: {
      registerField: typeof registerField;
      registerAction: typeof registerAction;
      registerPage: (path: string, component: PageComponent, options?: { label?: string }) => void;
    };
  }
}

function getRegistry(): Registry {
  if (!window.__newAdminRegistry__) {
    window.__newAdminRegistry__ = { fields: {}, actions: {}, pages: {} };
  }
  return window.__newAdminRegistry__;
}

// --- Field components ---

export function registerField(name: string, component: FieldComponent): void {
  getRegistry().fields[name] = component;
}

export function getField(name: string): FieldComponent | undefined {
  return getRegistry().fields[name];
}

// --- Custom actions ---

export function registerAction(name: string, config: CustomActionConfig): void {
  getRegistry().actions[name] = config;
}

export function getAction(name: string): CustomActionConfig | undefined {
  return getRegistry().actions[name];
}

export function getAllActions(): Record<string, CustomActionConfig> {
  return getRegistry().actions;
}

// --- Custom pages ---

function humanizePath(path: string): string {
  return path
    .split(/[-_/]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function registerPage(
  path: string,
  component: PageComponent,
  options?: { label?: string },
): void {
  getRegistry().pages[path] = {
    component,
    label: options?.label ?? humanizePath(path),
  };
}

export function getPage(path: string): PageEntry | undefined {
  return getRegistry().pages[path];
}

export function getAllPages(): Record<string, PageEntry> {
  return getRegistry().pages;
}
