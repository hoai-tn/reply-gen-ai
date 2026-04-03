import { supabase } from "@/lib/supabase"
import { uploadFile, deleteFile } from "./storage"

export interface Document {
  id: string
  business_id: string
  form_id: string | null
  name: string
  storage_path: string
  file_size: number
  created_at: string
}

export interface DocumentQueryParams {
  businessId: string
  formId?: string
}

export async function listDocuments({ businessId, formId }: DocumentQueryParams) {
  let query = supabase
    .from("documents")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
  if (formId) query = query.eq("form_id", formId)
  const { data, error } = await query
  if (error) throw error
  return data as Document[]
}

export async function uploadDocument({
  businessId,
  formId,
  file,
}: {
  businessId: string
  formId: string | null
  file: File
}) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const storagePath = `${businessId}/${uniqueSuffix}-${file.name}`

  await uploadFile(storagePath, file)

  const { data, error } = await supabase
    .from("documents")
    .insert({
      business_id: businessId,
      form_id: formId ?? null,
      name: file.name,
      storage_path: storagePath,
      file_size: file.size,
    })
    .select()
    .single()

  if (error) {
    // Clean up orphaned file if DB insert fails
    await deleteFile(storagePath).catch(() => null)
    throw error
  }

  return data as Document
}

export async function deleteDocument(id: string, storagePath: string) {
  await supabase.from("documents").delete().eq("id", id)
  await deleteFile(storagePath).catch(() => null)
}
