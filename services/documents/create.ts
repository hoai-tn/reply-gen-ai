import { supabaseServer } from "@/lib/supabase-server"
import type { CreateDocumentPayload } from "./types"

export async function createDocument(payload: CreateDocumentPayload) {
  const client = supabaseServer()
  const { data, error } = await client
    .from("documents")
    .insert([{ business_id: payload.businessId, form_id: payload.formId, name: payload.name }])
    .select()
    .single()
  if (error) throw error
  return data
}
