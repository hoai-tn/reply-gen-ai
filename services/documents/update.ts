import { supabaseServer } from "@/lib/supabase-server"
import type { UpdateDocumentPayload } from "./types"

export async function updateDocument(id: string, payload: UpdateDocumentPayload) {
  const client = supabaseServer()
  const { data, error } = await client
    .from("documents")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}
