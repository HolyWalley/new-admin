import { useState } from "react";
import { format, parse, isValid, setHours, setMinutes } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimeFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
  disabled?: boolean;
  htmlId?: string;
}

export function DateTimeField({ name, label, value, onChange, error, required, disabled, htmlId }: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const hasError = error && error.length > 0;

  const dateValue = value ? parseDateTime(value) : undefined;
  const hours = dateValue ? dateValue.getHours() : 0;
  const minutes = dateValue ? dateValue.getMinutes() : 0;

  function emitChange(date: Date) {
    // Emit as YYYY-MM-DDTHH:MM format (datetime-local compatible)
    const pad = (n: number) => String(n).padStart(2, "0");
    const str = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    onChange(str);
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    // Preserve existing time
    const withTime = setMinutes(setHours(date, hours), minutes);
    emitChange(withTime);
  }

  function handleHourChange(e: React.ChangeEvent<HTMLInputElement>) {
    const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
    if (!dateValue) {
      // If no date selected yet, use today
      const today = setMinutes(setHours(new Date(), h), minutes);
      emitChange(today);
    } else {
      emitChange(setHours(dateValue, h));
    }
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    if (!dateValue) {
      const today = setMinutes(setHours(new Date(), hours), m);
      emitChange(today);
    } else {
      emitChange(setMinutes(dateValue, m));
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
  }

  const timeInputClass = "h-7 w-14 rounded-md border border-input bg-transparent px-2 text-center text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <FieldWrapper name={name} label={label} error={error} required={required} htmlId={htmlId}>
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
            {dateValue
              ? format(dateValue, "MMM d, yyyy HH:mm")
              : "Pick date & time"}
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
            onSelect={handleDateSelect}
            defaultMonth={dateValue}
            captionLayout="dropdown"
          />
          <div className="border-t border-border px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Time:</span>
            <input
              type="number"
              min={0}
              max={23}
              value={String(hours).padStart(2, "0")}
              onChange={handleHourChange}
              className={timeInputClass}
              aria-label="Hours"
            />
            <span className="text-muted-foreground font-medium">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={String(minutes).padStart(2, "0")}
              onChange={handleMinuteChange}
              className={timeInputClass}
              aria-label="Minutes"
            />
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

function parseDateTime(str: string): Date | undefined {
  // Try datetime-local format: YYYY-MM-DDTHH:MM
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
    const d = new Date(str);
    return isValid(d) ? d : undefined;
  }
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = parse(str, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }
  // Try ISO
  const d = new Date(str);
  return isValid(d) ? d : undefined;
}
