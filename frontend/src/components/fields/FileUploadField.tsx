import { FieldWrapper } from "./FieldWrapper";
import { cn } from "@/lib/utils";
import type { AttachmentInfo } from "@/types";

interface FileUploadFieldProps {
  name: string;
  label: string;
  htmlId?: string;
  onChange: (file: File | null) => void;
  error?: string[];
  existingAttachment?: AttachmentInfo | null;
  onRemove?: () => void;
  removeFlag?: boolean;
}

export function FileUploadField({ name, label, htmlId, onChange, error, existingAttachment, onRemove, removeFlag }: FileUploadFieldProps) {
  const hasError = error && error.length > 0;
  const isImage = existingAttachment?.content_type?.startsWith("image/");

  return (
    <FieldWrapper name={name} label={label} error={error} htmlId={htmlId}>
      {existingAttachment && !removeFlag && (
        <div className="mb-2 space-y-2">
          {isImage && existingAttachment.url ? (
            <img
              src={existingAttachment.thumbnail_url ?? existingAttachment.url}
              alt={existingAttachment.filename}
              className="h-24 w-24 rounded-md border border-border object-cover"
            />
          ) : null}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{existingAttachment.filename}</span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-destructive hover:underline text-xs"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
      <input
        type="file"
        id={htmlId ?? name}
        name={name}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </FieldWrapper>
  );
}
