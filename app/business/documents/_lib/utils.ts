import type { Document } from "@/services/supabase/document"
import type { DocType, TabValue } from "./types"

export const ACCEPTED = ".pdf,.doc,.docx,.txt"
export const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]

export function fileExt(name: string): DocType {
  const ext = name.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return "pdf"
  if (ext === "doc") return "doc"
  if (ext === "docx") return "docx"
  return "txt"
}

export function matchTab(doc: Document, tab: TabValue) {
  if (tab === "all") return true
  const ext = fileExt(doc.name)
  if (tab === "pdf") return ext === "pdf"
  if (tab === "word") return ext === "doc" || ext === "docx"
  if (tab === "txt") return ext === "txt"
  return true
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
