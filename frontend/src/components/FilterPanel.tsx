import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ColumnDef, FilterRule } from "@/types";
import { FILTER_OPERATORS } from "@/types";

interface FilterPanelProps {
  rules: FilterRule[];
  columns: ColumnDef[];
  enums: Record<string, string[]>;
  onChange: (rules: FilterRule[]) => void;
}

const FILTERABLE_TYPES = new Set([
  "string", "text", "enum", "boolean", "integer", "decimal", "float", "date", "datetime",
]);

const DEBOUNCE_MS = 400;

export function FilterPanel({ rules, columns, enums, onChange }: FilterPanelProps) {
  const [localRules, setLocalRules] = useState<FilterRule[]>(rules);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isEditingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from props — but skip if we're actively editing
  useEffect(() => {
    if (isEditingRef.current) {
      isEditingRef.current = false;
    } else {
      setLocalRules(rules);
      setEditingIndex(null);
    }
  }, [rules]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const filterableColumns = columns.filter(
    (col) => !col.primary_key && FILTERABLE_TYPES.has(col.type)
  );

  function getColumn(name: string): ColumnDef | undefined {
    return columns.find((c) => c.name === name);
  }

  function getOperators(colName: string) {
    const col = getColumn(colName);
    if (!col) return [];
    return FILTER_OPERATORS[col.type] ?? [];
  }

  function isUnaryOp(colName: string, operator: string): boolean {
    const ops = getOperators(colName);
    return ops.find((o) => o.key === operator)?.unary ?? false;
  }

  function getEnumValues(colName: string): string[] {
    if (enums[colName]) return enums[colName];
    const col = getColumn(colName);
    return col?.enum_values ?? [];
  }

  const applyFilters = useCallback((updatedRules: FilterRule[]) => {
    isEditingRef.current = true;
    const applicable = updatedRules.filter((r) => isUnaryOp(r.column, r.operator) || r.value);
    onChange(applicable);
  }, [onChange, columns]);

  function applyFiltersDebounced(updatedRules: FilterRule[]) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(updatedRules);
    }, DEBOUNCE_MS);
  }

  function addFilter(col: ColumnDef) {
    const ops = FILTER_OPERATORS[col.type] ?? [];
    const defaultOp = ops[0]?.key ?? "is";
    const isUnary = ops[0]?.unary ?? false;

    const newRule: FilterRule = { column: col.name, operator: defaultOp, value: "" };

    if (isUnary) {
      onChange([...rules, newRule]);
    } else {
      const newLocal = [...localRules, newRule];
      setLocalRules(newLocal);
      setEditingIndex(newLocal.length - 1);
    }
    setDropdownOpen(false);
  }

  function updateRule(index: number, patch: Partial<FilterRule>, mode: "local" | "navigate" | "debounce") {
    const updated = localRules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    setLocalRules(updated);

    if (mode === "navigate") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const rule = { ...localRules[index], ...patch };
      const unary = isUnaryOp(rule.column, rule.operator);
      if (unary || rule.value) {
        applyFilters(updated);
      }
    } else if (mode === "debounce") {
      const rule = { ...localRules[index], ...patch };
      if (rule.value) {
        applyFiltersDebounced(updated);
      }
    }
  }

  function removeRule(index: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const updated = localRules.filter((_, i) => i !== index);
    setLocalRules(updated);
    setEditingIndex(null);
    const applicable = updated.filter((r) => isUnaryOp(r.column, r.operator) || r.value);
    onChange(applicable);
  }

  const hasRules = localRules.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {localRules.map((rule, i) => {
          const ops = getOperators(rule.column);
          const opDef = ops.find((o) => o.key === rule.operator);
          const unary = isUnaryOp(rule.column, rule.operator);
          const isApplied = i < rules.length;
          const isEditingThis = editingIndex === i;

          return (
            <Badge
              key={`${rule.column}-${i}`}
              variant={isApplied ? "secondary" : "outline"}
              className={`gap-1 py-1 px-2 text-xs font-normal ${isApplied && !isEditingThis ? "cursor-pointer hover:bg-accent" : ""}`}
              onClick={() => {
                if (isApplied && !isEditingThis) setEditingIndex(i);
              }}
            >
              <span className="font-medium">{rule.column}</span>
              <span className="text-muted-foreground">{opDef?.label ?? rule.operator}</span>
              {!unary && rule.value && <span>{rule.value}{rule.operator === "between" && rule.value2 && ` — ${rule.value2}`}</span>}
              {!unary && !rule.value && <span className="text-muted-foreground italic">…</span>}
              {isApplied && !isEditingThis && (
                <Pencil className="h-2.5 w-2.5 opacity-40" />
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeRule(i); }}
                className="ml-0.5 hover:text-destructive"
                data-action="remove-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <PopoverTrigger
            render={
              <Button
                variant={hasRules ? "ghost" : "outline"}
                size="sm"
                data-action="add-filter"
                className={hasRules ? "h-7 px-2 text-xs text-muted-foreground" : ""}
              />
            }
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {hasRules ? "Add" : "Add filter"}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1">
            {filterableColumns.map((col) => (
              <button
                key={col.name}
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                data-filter-field={col.name}
                onClick={() => addFilter(col)}
              >
                {col.name}
                <span className="ml-1 text-xs text-muted-foreground">({col.type})</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Expanded edit row for the selected filter */}
      {editingIndex !== null && localRules[editingIndex] && (
        <FilterRuleRow
          rule={localRules[editingIndex]}
          column={getColumn(localRules[editingIndex].column)}
          operators={getOperators(localRules[editingIndex].column)}
          enumValues={getEnumValues(localRules[editingIndex].column)}
          onUpdate={(patch, mode) => updateRule(editingIndex, patch, mode)}
          onRemove={() => removeRule(editingIndex)}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {/* Pending (new, not yet applied) rules always show their edit row */}
      {localRules.map((rule, i) => {
        if (i < rules.length) return null;
        if (i === editingIndex) return null;
        return (
          <FilterRuleRow
            key={`pending-${i}`}
            rule={rule}
            column={getColumn(rule.column)}
            operators={getOperators(rule.column)}
            enumValues={getEnumValues(rule.column)}
            onUpdate={(patch, mode) => updateRule(i, patch, mode)}
            onRemove={() => removeRule(i)}
          />
        );
      })}
    </div>
  );
}

function FilterRuleRow({
  rule, column, operators, enumValues, onUpdate, onRemove, onClose,
}: {
  rule: FilterRule;
  column: ColumnDef | undefined;
  operators: Array<{ key: string; label: string; unary?: boolean }>;
  enumValues: string[];
  onUpdate: (patch: Partial<FilterRule>, mode: "local" | "navigate" | "debounce") => void;
  onRemove: () => void;
  onClose?: () => void;
}) {
  const currentOp = operators.find((o) => o.key === rule.operator);
  const isUnary = currentOp?.unary ?? false;
  const isBetween = rule.operator === "between";

  const inputClass = "h-7 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  function handleOperatorChange(op: string | null) {
    const key = op as string;
    const newOp = operators.find((o) => o.key === key);
    onUpdate(
      newOp?.unary
        ? { operator: key, value: "", value2: undefined }
        : { operator: key },
      newOp?.unary ? "navigate" : "local"
    );
  }

  function renderValueInput() {
    if (isUnary) return null;

    if (column?.type === "enum" && enumValues.length > 0) {
      return (
        <Select
          value={rule.value}
          onValueChange={(val) => onUpdate({ value: val as string }, "navigate")}
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="— select —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— select —</SelectItem>
            {enumValues.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column?.type === "date" || column?.type === "datetime") {
      return (
        <>
          <input
            type="date"
            value={rule.value}
            onChange={(e) => onUpdate({ value: e.target.value }, "navigate")}
            className={`${inputClass} w-36`}
          />
          {isBetween && (
            <>
              <span className="text-xs text-muted-foreground">and</span>
              <input
                type="date"
                value={rule.value2 ?? ""}
                onChange={(e) => onUpdate({ value2: e.target.value }, "navigate")}
                className={`${inputClass} w-36`}
              />
            </>
          )}
        </>
      );
    }

    if (column?.type === "integer" || column?.type === "decimal" || column?.type === "float") {
      return (
        <>
          <input
            type="number"
            value={rule.value}
            onChange={(e) => onUpdate({ value: e.target.value }, "debounce")}
            onKeyDown={(e) => { if (e.key === "Enter") { if (rule.value) onUpdate({}, "navigate"); onClose?.(); } }}
            className={`${inputClass} w-28`}
            step={column.type === "integer" ? "1" : "0.01"}
            autoFocus
          />
          {isBetween && (
            <>
              <span className="text-xs text-muted-foreground">and</span>
              <input
                type="number"
                value={rule.value2 ?? ""}
                onChange={(e) => onUpdate({ value2: e.target.value }, "debounce")}
                onKeyDown={(e) => { if (e.key === "Enter") { if (rule.value) onUpdate({}, "navigate"); onClose?.(); } }}
                className={`${inputClass} w-28`}
                step={column.type === "integer" ? "1" : "0.01"}
              />
            </>
          )}
        </>
      );
    }

    // Default: text input — debounced live apply
    return (
      <input
        type="text"
        value={rule.value}
        onChange={(e) => onUpdate({ value: e.target.value }, "debounce")}
        onKeyDown={(e) => { if (e.key === "Enter") { if (rule.value) onUpdate({}, "navigate"); onClose?.(); } }}
        placeholder="value..."
        className={`${inputClass} w-40`}
        autoFocus
      />
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5">
      <span className="text-sm font-medium min-w-[80px]">{rule.column}</span>

      <Select
        value={rule.operator}
        onValueChange={handleOperatorChange}
      >
        <SelectTrigger size="sm" className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.key} value={op.key}>{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderValueInput()}

      <div className="ml-auto flex items-center gap-1">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Collapse"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
          data-action="remove-filter"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
