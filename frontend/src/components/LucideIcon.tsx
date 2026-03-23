import * as LucideIcons from "lucide-react";

interface LucideIconProps {
  name?: string | null;
  className?: string;
}

/**
 * Render a Lucide icon by name string (e.g., "Archive", "CreditCard").
 * Returns null if the name doesn't match any known icon.
 */
export function LucideIcon({ name, className = "h-3.5 w-3.5" }: LucideIconProps) {
  if (!name) return null;

  const Icon = (LucideIcons as Record<string, unknown>)[name] as
    | React.ComponentType<{ className?: string }>
    | undefined;

  // Lucide icons are forwardRef objects (typeof "object"), not plain functions
  if (!Icon) return null;

  return <Icon className={className} />;
}
