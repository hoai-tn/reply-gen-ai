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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
type Mode = "file" | "paste"

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
  const [mode, setMode] = React.useState<Mode>("file")
  const [file, setFile] = React.useState<File | null>(null)
  const [pasteText, setPasteText] = React.useState("")
  const [pasteName, setPasteName] = React.useState("")
  const [formId, setFormId] = React.useState("")
  const [err, setErr] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState<Progress>("idle")

  function reset() {
    setMode("file")
    setFile(null)
    setPasteText("")
    setPasteName("")
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

  function handleModeChange(v: string) {
    setMode(v as Mode)
    setErr(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let uploadFile: File | null = null

    if (mode === "file") {
      if (!file) return setErr("Please select a file.")
      uploadFile = file
    } else {
      if (!pasteText.trim()) return setErr("Please paste some text.")
      const name = pasteName.trim() || "pasted-text"
      uploadFile = new File([pasteText], `${name}.txt`, { type: "text/plain" })
    }

    setErr(null)
    setUploading(true)
    setProgress("uploading")

    try {
      setProgress("saving")
      const doc = await uploadDocument({
        businessId,
        formId: formId || null,
        file: uploadFile,
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

  const canSubmit =
    !uploading && (mode === "file" ? !!file : pasteText.trim().length > 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1">
                Upload file
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex-1">
                Paste text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-3">
              <UploadDropzone
                file={file}
                onFile={handleFile}
                onRemove={() => setFile(null)}
              />
            </TabsContent>

            <TabsContent value="paste" className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label>Document name (optional)</Label>
                <input
                  type="text"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  placeholder="e.g. company-faq"
                  className="h-8 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Saved as <span className="font-mono">{(pasteName.trim() || "pasted-text")}.txt</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Content</Label>
                <Textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your text here…"
                  className="min-h-36 resize-none text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>

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
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {uploading ? submitLabel : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
