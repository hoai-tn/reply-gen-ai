import { supabase } from "@/lib/supabase"

export interface DocumentQueryParams {
  businessId: string
  formId?: string
}

export interface CreateDocumentPayload {
  businessId: string
  formId: string
  name: string
}

export interface UpdateDocumentPayload {
  name?: string
}

export async function listDocuments({ businessId, formId }: DocumentQueryParams) {
  const client = supabase
  let query = client.from("documents").select("*").eq("business_id", businessId)
  if (formId) query = query.eq("form_id", formId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDocument(payload: CreateDocumentPayload) {
  const client = supabase
  const { data, error } = await client
    .from("documents")
    .insert([{ business_id: payload.businessId, form_id: payload.formId, name: payload.name }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDocument(id: string, payload: UpdateDocumentPayload) {
  const client = supabase
  const { data, error } = await client
    .from("documents")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDocument(id: string) {
  const client = supabase
  const { error } = await client.from("documents").delete().eq("id", id)
  if (error) throw error
}
