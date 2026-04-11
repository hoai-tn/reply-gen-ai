import pdfParse from "pdf-parse"
import mammoth from "mammoth"
import * as XLSX from "xlsx"
import { supabaseServer } from "@/lib/supabase-server"
import { chunkText } from "./chunker"
import { embedDocuments } from "./embedder"

const CHUNK_BATCH_SIZE = 100

export type PipelineInput = {
  documentId: string
  businessId: string
  formId: string
  file: File
}

// ─── Text extraction ────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  if (name.endsWith(".txt")) {
    return file.text()
  }

  if (name.endsWith(".pdf")) {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (name.endsWith(".doc") || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (name.endsWith(".xls") || name.endsWith(".xlsx")) {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    return workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      return XLSX.utils.sheet_to_csv(sheet)
    }).join("\n\n")
  }

  throw new Error(`Unsupported file type: ${file.name}`)
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

export async function runDocumentPipeline({
  documentId,
  businessId,
  formId,
  file,
}: PipelineInput): Promise<{ chunks: number }> {
  // 1. Extract
  const text = await extractText(file)
  if (!text.trim()) throw new Error("No text content found in document")

  // 2. Chunk
  const chunks = await chunkText([text])
  if (chunks.length === 0) throw new Error("Failed to produce chunks")

  // 3. Embed + store in batches to avoid memory/API limits
  const client = supabaseServer()

  for (let i = 0; i < chunks.length; i += CHUNK_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + CHUNK_BATCH_SIZE)
    const batchEmbeddings = await embedDocuments(batchChunks)

    const rows = batchChunks.map((content, j) => ({
      document_id: documentId,
      business_id: businessId,
      form_id: formId,
      content,
      embedding: JSON.stringify(batchEmbeddings[j]),
    }))

    const { error } = await client.from("document_chunks").insert(rows)
    if (error) throw error
  }

  return { chunks: chunks.length }
}
