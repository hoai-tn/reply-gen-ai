import { supabaseServer } from "@/lib/supabase-server"

export async function deleteDocument(id: string) {
  const client = supabaseServer()
  const { error } = await client.from("documents").delete().eq("id", id)
  if (error) throw error
}
