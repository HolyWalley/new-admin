import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
  help?: string;
}

export function DateField({ name, label, value, onChange, error, required, disabled, htmlId, help }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const hasError = error && error.length > 0;

  const dateValue = value ? parseDate(value) : undefined;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
  }

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId} help={help}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              id={htmlId ?? name}
              disabled={disabled}
              className={cn(
                "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
                hasError && "border-destructive ring-3 ring-destructive/20",
                !dateValue && "text-muted-foreground",
              )}
            />
          }
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {dateValue ? format(dateValue, "MMM d, yyyy") : "Pick a date"}
          </span>
          {dateValue && !required && (
            <span
              role="button"
              className="rounded-sm p-0.5 hover:bg-accent"
              onClick={handleClear}
              onPointerDown={(e) => e.preventDefault()}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            defaultMonth={dateValue}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

function parseDate(str: string): Date | undefined {
  // Try YYYY-MM-DD first
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = parse(str, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }
  // Try ISO datetime
  const d = new Date(str);
  return isValid(d) ? d : undefined;
}
