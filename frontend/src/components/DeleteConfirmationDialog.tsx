import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, Trash2, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { CascadeInfo, CascadeEntry } from "@/types";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelParamKey: string;
  recordId: number | string;
  recordDisplayName: string;
  modelName: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  modelParamKey,
  recordId,
  recordDisplayName,
  modelName,
}: DeleteConfirmationDialogProps) {
  const [cascadeInfo, setCascadeInfo] = useState<CascadeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCascadeInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/new-admin/${modelParamKey}/${recordId}/delete_confirmation`,
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json();
      setCascadeInfo(data);
    } catch {
      setCascadeInfo({ record: { display_name: recordDisplayName, model: modelName }, cascades: [], restrict: [] });
    } finally {
      setLoading(false);
    }
  }, [modelParamKey, recordId, recordDisplayName, modelName]);

  useEffect(() => {
    if (open) {
      setCascadeInfo(null);
      setDeleting(false);
      fetchCascadeInfo();
    }
  }, [open, fetchCascadeInfo]);

  function handleDelete() {
    setDeleting(true);
    router.delete(`/new-admin/${modelParamKey}/${recordId}`, {
      onFinish: () => {
        setDeleting(false);
        onOpenChange(false);
      },
    });
  }

  const hasRestrictions = cascadeInfo && cascadeInfo.restrict.length > 0;
  const hasCascades = cascadeInfo && cascadeInfo.cascades.length > 0;
  const hasNullifies = cascadeInfo?.cascades.some((c) => c.dependent === "nullify");
  const destroyCascades = cascadeInfo?.cascades.filter((c) => c.dependent !== "nullify") ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Delete {modelName}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{recordDisplayName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking associations...
            </div>
          )}

          {hasRestrictions && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                Deletion blocked
              </div>
              <p className="text-xs text-muted-foreground">
                This record cannot be deleted because it has restricted associations:
              </p>
              <ul className="text-xs space-y-1 ml-6 list-disc">
                {cascadeInfo!.restrict.map((r) => (
                  <li key={r.association}>
                    <strong>{r.association}</strong> — {r.count}{" "}
                    {r.count === 1 ? "record" : "records"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {destroyCascades.length > 0 && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/5 p-3 space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                Will be deleted
              </div>
              <CascadeTree entries={destroyCascades} />
            </div>
          )}

          {hasNullifies && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
                <Unlink className="h-4 w-4 mt-0.5 shrink-0" />
                Will be unlinked
              </div>
              <ul className="text-xs space-y-1 ml-6 list-disc text-muted-foreground">
                {cascadeInfo!.cascades
                  .filter((c) => c.dependent === "nullify")
                  .map((c) => (
                    <li key={c.association}>
                      <strong>{c.association}</strong> — {c.count}{" "}
                      {c.count === 1 ? "record" : "records"} (foreign key set to null)
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {!loading && !hasCascades && !hasRestrictions && (
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || deleting || !!hasRestrictions}
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CascadeTree({ entries, depth = 0 }: { entries: CascadeEntry[]; depth?: number }) {
  return (
    <ul className={`text-xs space-y-1 ${depth === 0 ? "ml-6" : "ml-4"} list-disc text-muted-foreground`}>
      {entries.map((entry) => (
        <li key={entry.association}>
          <strong>{entry.association}</strong> — {entry.count}{" "}
          {entry.count === 1 ? "record" : "records"}
          {entry.children && entry.children.length > 0 && (
            <CascadeTree entries={entry.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

interface BulkDeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelParamKey: string;
  modelName: string;
  selectedCount: number;
  selectedIds: Set<number | string>;
  onSuccess: () => void;
}

export function BulkDeleteConfirmationDialog({
  open,
  onOpenChange,
  modelParamKey,
  modelName,
  selectedCount,
  selectedIds,
  onSuccess,
}: BulkDeleteConfirmationDialogProps) {
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    setDeleting(true);
    router.delete(`/new-admin/${modelParamKey}/bulk_destroy`, {
      data: { bulk_ids: Array.from(selectedIds) },
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
      },
      onFinish: () => setDeleting(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Delete {selectedCount} {selectedCount === 1 ? "record" : "records"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} selected {modelName}{" "}
            {selectedCount === 1 ? "record" : "records"}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting..." : `Delete ${selectedCount}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
