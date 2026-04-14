import mammoth from "mammoth"
import * as XLSX from "xlsx"
import { chunkText } from "./chunker"
import { embedDocuments } from "./embedder"

const CHUNK_BATCH_SIZE = 100 // Adjust based on memory limits and embedding API constraints

export type PipelineInput = {
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (
      buffer: Buffer
    ) => Promise<{ text: string }>
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

export async function runDocumentPipeline({ file }: PipelineInput) {
  // 1. Extract
  const text = await extractText(file)
  if (!text.trim()) throw new Error("No text content found in document")

  // 2. Chunk
  const chunks = await chunkText([text])
  if (chunks.length === 0) throw new Error("Failed to produce chunks")

  // 3. Embed + store in batches to avoid memory/API limits
  const results = []
  for (let i = 0; i < chunks.length; i += CHUNK_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + CHUNK_BATCH_SIZE)
    const batchEmbeddings = await embedDocuments(batchChunks)

    const rows = batchChunks.map((content, j) => ({
      content,
      embedding: batchEmbeddings[j],
    }))
    results.push(...rows)
  }

  return { results }
}
