"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  listDocuments,
  getLinkedDocumentIds,
  syncFormDocuments,
  type Document,
} from "@/services/supabase/document"
import { formatBytes } from "@/app/business/documents/_lib/utils"

export function LinkDocumentsDialog({
  open,
  onOpenChange,
  formId,
  businessId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  formId: string
  businessId: string
  onSaved: (count: number) => void
}) {
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [initialIds, setInitialIds] = React.useState<string[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    setErr(null)
    Promise.all([listDocuments(businessId), getLinkedDocumentIds(formId)])
      .then(([docs, linked]) => {
        setDocuments(docs)
        setInitialIds(linked)
        setSelectedIds(linked)
      })
      .catch(() => setErr("Failed to load documents."))
      .finally(() => setLoading(false))
  }, [open, businessId, formId])

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSave() {
    setSaving(true)
    setErr(null)
    try {
      await syncFormDocuments(formId, selectedIds, initialIds)
      onSaved(selectedIds.length)
      onOpenChange(false)
    } catch {
      setErr("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link documents</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={13}
            strokeWidth={1.5}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-md border border-border">
          {loading ? (
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="size-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {documents.length === 0 ? "No documents uploaded yet." : "No matches."}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((doc) => {
                const checked = selectedIds.includes(doc.id)
                return (
                  <label
                    key={doc.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(doc.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {doc.name}
                      </p>
                      {doc.file_size > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          {formatBytes(doc.file_size)}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            {selectedIds.length} document{selectedIds.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {err && <p className="text-xs text-destructive">{err}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
