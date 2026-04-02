import { supabaseServer } from "@/lib/supabase-server"
import type { DocumentQueryParams } from "./types"

export async function listDocuments({ businessId, formId }: DocumentQueryParams) {
  const client = supabaseServer()
  let query = client.from("documents").select("*").eq("business_id", businessId)
  if (formId) query = query.eq("form_id", formId)
  const { data, error } = await query
  if (error) throw error
  return data
}
