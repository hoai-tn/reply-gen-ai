import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Link01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import type { Document } from "@/services/supabase/document"
import type { Form } from "@/services/supabase/form"
import { fileExt, formatDate, formatBytes } from "../_lib/utils"
import { DocumentFileIcon } from "./document-file-icon"

export function DocumentRow({
  doc,
  form,
  onDelete,
}: {
  doc: Document
  form: Form | undefined
  onDelete: (doc: Document) => void
}) {
  const ext = fileExt(doc.name)

  return (
    <div className="group/row flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <DocumentFileIcon type={ext} size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {doc.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {doc.file_size > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {formatBytes(doc.file_size)}
            </span>
          )}
          {form && (
            <>
              {doc.file_size > 0 && (
                <span className="text-[11px] text-muted-foreground">·</span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <HugeiconsIcon
                  icon={Link01Icon}
                  size={10}
                  strokeWidth={1.5}
                  className="shrink-0"
                />
                {form.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          {ext.toUpperCase()}
        </Badge>
        <span className="w-24 text-right text-[11px] text-muted-foreground">
          {formatDate(doc.created_at)}
        </span>
        <button
          onClick={() => onDelete(doc)}
          className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover/row:opacity-100"
          title="Delete"
        >
          <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
