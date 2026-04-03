"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadDocument, type Document } from "@/services/supabase/document"
import type { Form } from "@/services/supabase/form"
import { UploadDropzone } from "./upload-dropzone"

type Progress = "idle" | "uploading" | "saving"

export function UploadDialog({
  open,
  onOpenChange,
  businessId,
  forms,
  onUploaded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string
  forms: Form[]
  onUploaded: (doc: Document) => void
}) {
  const [file, setFile] = React.useState<File | null>(null)
  const [formId, setFormId] = React.useState("")
  const [err, setErr] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState<Progress>("idle")

  function reset() {
    setFile(null)
    setFormId("")
    setErr(null)
    setUploading(false)
    setProgress("idle")
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function handleFile(f: File) {
    setErr(null)
    setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setErr("Please select a file.")
    setErr(null)
    setUploading(true)
    setProgress("uploading")
    try {
      setProgress("saving")
      const doc = await uploadDocument({
        businessId,
        formId: formId || null,
        file,
      })
      reset()
      onUploaded(doc)
    } catch (error) {
      console.error("Upload failed", error)
      setErr("Upload failed. Please try again.")
      setUploading(false)
      setProgress("idle")
    }
  }

  const submitLabel =
    progress === "uploading"
      ? "Uploading…"
      : progress === "saving"
        ? "Saving…"
        : "Upload"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UploadDropzone
            file={file}
            onFile={handleFile}
            onRemove={() => setFile(null)}
          />

          <div className="space-y-1.5">
            <Label>Link to form (optional)</Label>
            <Select value={formId} onValueChange={setFormId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a form…" />
              </SelectTrigger>
              <SelectContent>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              When linked, the AI uses this document only for that form&apos;s
              submissions.
            </p>
          </div>

          {err && <p className="text-xs text-destructive">{err}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={uploading || !file}>
              {uploading ? submitLabel : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
