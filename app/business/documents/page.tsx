"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { getMe } from "@/services/supabase"
import {
  listDocuments,
  deleteDocument,
  type Document,
} from "@/services/supabase/document"
import { listForms, type Form } from "@/services/supabase/form"
import { type TabValue } from "./_lib/types"
import { DocumentListSkeleton } from "./_components/document-list"
import { DocumentTabs } from "./_components/document-tabs"
import { DocumentsEmptyState } from "./_components/documents-empty-state"
import { UploadDialog } from "./_components/upload-dialog"

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [forms, setForms] = React.useState<Form[]>([])
  const [businessId, setBusinessId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<TabValue>("all")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        if (!me?.business) {
          setError("No business found for this account.")
          return
        }
        const bId = me.business.id
        setBusinessId(bId)
        const [docs, formList] = await Promise.all([
          listDocuments({ businessId: bId }),
          listForms(bId),
        ])
        setDocuments(docs)
        setForms(formList)
      } catch {
        setError("Failed to load documents.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleUploaded(doc: Document) {
    setDocuments((prev) => [doc, ...prev])
    setOpen(false)
  }

  async function handleDelete(doc: Document) {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
    try {
      await deleteDocument(doc.id, doc.storage_path)
    } catch {
      setDocuments((prev) => [doc, ...prev])
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Documents</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Upload documents for AI context retrieval
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={() => setOpen(true)}
          title="Upload document"
          disabled={!businessId}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} strokeWidth={2} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        {error ? (
          <p className="text-center text-xs text-destructive">{error}</p>
        ) : loading ? (
          <DocumentListSkeleton />
        ) : documents.length === 0 ? (
          <DocumentsEmptyState onUpload={() => setOpen(true)} />
        ) : (
          <DocumentTabs
            tab={tab}
            onTabChange={setTab}
            documents={documents}
            forms={forms}
            onDelete={handleDelete}
          />
        )}
      </div>

      {businessId && (
        <UploadDialog
          open={open}
          onOpenChange={setOpen}
          businessId={businessId}
          forms={forms}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  )
}
