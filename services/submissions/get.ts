import { supabaseServer } from "@/lib/supabase-server"

export async function listSubmissions(formId: string) {
  const client = supabaseServer()
  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}
