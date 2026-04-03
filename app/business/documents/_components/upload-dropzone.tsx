"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon } from "@hugeicons/core-free-icons"
import { ACCEPTED, ACCEPTED_MIME, fileExt, formatBytes } from "../_lib/utils"
import { DocumentFileIcon } from "./document-file-icon"

export function UploadDropzone({
  file,
  onFile,
  onRemove,
}: {
  file: File | null
  onFile: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  function validate(f: File): boolean {
    if (
      !ACCEPTED_MIME.includes(f.type) &&
      !f.name.match(/\.(pdf|doc|docx|txt)$/i)
    )
      return false
    if (f.size > 20 * 1024 * 1024) return false
    return true
  }

  function handleFile(f: File) {
    if (validate(f)) onFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging
          ? "border-ring bg-ring/5"
          : "border-border hover:border-ring/50 hover:bg-muted/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />

      {file ? (
        <>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <DocumentFileIcon type={fileExt(file.name)} size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={CloudUploadIcon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              Drop a file or click to browse
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              PDF, DOC, DOCX, TXT · max 20 MB
            </p>
          </div>
        </>
      )}
    </div>
  )
}
