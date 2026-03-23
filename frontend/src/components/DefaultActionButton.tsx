import { useState } from "react";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "@/components/LucideIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { CustomActionProps, ServerActionConfig } from "@/types";

interface DefaultActionButtonProps extends CustomActionProps {
  actionConfig: ServerActionConfig;
}

/**
 * Auto-generated UI for server-defined custom actions.
 * Renders as an icon button for inline member actions,
 * or a labeled button for collection actions.
 */
export function DefaultActionButton({
  record,
  modelParamKey,
  actionConfig,
}: DefaultActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMember = actionConfig.scope === "member";

  function buildUrl() {
    if (isMember && record) {
      return `/new-admin/${modelParamKey}/${record.id}/actions/${actionConfig.name}`;
    }
    return `/new-admin/${modelParamKey}/actions/${actionConfig.name}`;
  }

  function executeAction() {
    setLoading(true);
    router.post(buildUrl(), {}, {
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  }

  function handleClick() {
    if (actionConfig.confirm) {
      setConfirmOpen(true);
    } else {
      executeAction();
    }
  }

  // Inline member actions: small icon button (matches View/Edit/Delete style)
  if (isMember && actionConfig.display === "inline") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon-sm"
          title={actionConfig.label}
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LucideIcon name={actionConfig.icon} />
          )}
        </Button>
        {actionConfig.confirm && (
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={actionConfig.label}
            message={actionConfig.confirm}
            onConfirm={() => {
              setConfirmOpen(false);
              executeAction();
            }}
          />
        )}
      </>
    );
  }

  // Collection actions or non-inline: labeled button
  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <LucideIcon name={actionConfig.icon} className="h-3.5 w-3.5 mr-1.5" />
        )}
        {actionConfig.label}
      </Button>
      {actionConfig.confirm && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={actionConfig.label}
          message={actionConfig.confirm}
          onConfirm={() => {
            setConfirmOpen(false);
            executeAction();
          }}
        />
      )}
    </>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={onConfirm}>{title}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
