import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
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
import type { ServerActionConfig, RecordData } from "@/types";

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionConfig: ServerActionConfig;
  modelParamKey: string;
  record?: RecordData;
  /** Optional custom component to render inside the modal with GET data as props */
  children?: (data: Record<string, unknown>) => React.ReactNode;
}

/**
 * Modal wrapper for :modal display mode actions.
 * If the action supports GET, fetches data first before showing.
 * POST on confirm, then reloads via Inertia.
 */
export function ActionModal({
  open,
  onOpenChange,
  actionConfig,
  modelParamKey,
  record,
  children,
}: ActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);

  const url = record
    ? `/new-admin/${modelParamKey}/${record.id}/actions/${actionConfig.name}`
    : `/new-admin/${modelParamKey}/actions/${actionConfig.name}`;

  const hasGet = actionConfig.http_methods.includes("get");

  const fetchModalData = useCallback(async () => {
    if (!hasGet) {
      setModalData({});
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setModalData(data);
    } catch {
      setModalData({});
    } finally {
      setLoading(false);
    }
  }, [url, hasGet]);

  useEffect(() => {
    if (open) {
      setModalData(null);
      setExecuting(false);
      fetchModalData();
    }
  }, [open, fetchModalData]);

  function handleExecute() {
    setExecuting(true);
    router.post(url, {}, {
      preserveScroll: true,
      onFinish: () => {
        setExecuting(false);
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionConfig.label}</DialogTitle>
          {actionConfig.confirm && (
            <DialogDescription>{actionConfig.confirm}</DialogDescription>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}

        {!loading && modalData && children && children(modalData)}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleExecute} disabled={loading || executing}>
            {executing && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            {executing ? "Processing..." : actionConfig.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
