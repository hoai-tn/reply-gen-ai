import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { runDocumentPipeline } from "@/services/rag"

const BUCKET = "documents"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const businessId = formData.get("businessId") as string | null
  const formId = formData.get("formId") as string | null

  if (!file || !businessId) {
    return NextResponse.json(
      { error: "file and businessId are required" },
      { status: 400 }
    )
  }

  const client = await supabaseServer()

  // 1. Upload file to storage
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const storagePath = `${businessId}/${uniqueSuffix}-${file.name}`

  const { error: storageError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // 2. Create document record
  const { data: doc, error: dbError } = await client
    .from("documents")
    .insert({
      business_id: businessId,
      name: file.name,
      storage_path: storagePath,
      file_size: file.size,
    })
    .select()
    .single()

  if (dbError) {
    await client.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // 3. Link to form (optional)
  if (formId) {
    const { error: linkError } = await client
      .from("form_documents")
      .insert({ form_id: formId, document_id: doc.id })

    if (linkError) {
      await client.storage.from(BUCKET).remove([storagePath])
      await client.from("documents").delete().eq("id", doc.id)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }
  }

  // 4. Run RAG pipeline then insert chunks (fire and forget)
  runDocumentPipeline({ file })
    .then(async ({ results }) => {
      const rows = results.map(({ content, embedding }) => ({
        document_id: doc.id,
        business_id: businessId,
        form_id: formId,
        content,
        embedding,
      }))
      const { error } = await client.from("document_chunks").insert(rows)
      if (error) throw error
      console.log(`Document ${doc.id} processed with ${results.length} chunks`)
    })
    .catch((err) => {
      console.error(`Pipeline failed for document ${doc.id}:`, err)
    })

  return NextResponse.json({ data: doc }, { status: 201 })
}
