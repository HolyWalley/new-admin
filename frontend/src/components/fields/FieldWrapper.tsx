import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  name: string;
  label: string;
  error?: string[];
  required?: boolean;
  htmlId?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ name, label, error, required, htmlId, children }: FieldWrapperProps) {
  const hasError = error && error.length > 0;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlId ?? name}
        className={cn(
          "block text-sm font-medium",
          hasError ? "text-destructive" : "text-foreground"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hasError && (
        <p className="text-xs text-destructive">{error.join(", ")}</p>
      )}
    </div>
  );
}
