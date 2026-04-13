import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Document } from "@/services/supabase/document"
import type { Form } from "@/services/supabase/form"
import { DocumentRow } from "./document-row"

export function DocumentList({
  docs,
  forms,
  onDelete,
}: {
  docs: Document[]
  forms: Form[]
  onDelete: (doc: Document) => void
}) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-foreground">No documents</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No documents match this filter.
        </p>
      </div>
    )
  }

  return (
    <Card className="divide-y divide-border py-0">
      {docs.map((doc) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          forms={forms.filter((f) =>
            doc.form_documents?.some((fd) => fd.form_id === f.id)
          )}
          onDelete={onDelete}
        />
      ))}
    </Card>
  )
}

export function DocumentListSkeleton() {
  return (
    <Card className="divide-y divide-border py-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </Card>
  )
}
