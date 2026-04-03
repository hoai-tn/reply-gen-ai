import { supabase } from "@/lib/supabase"

export interface Form {
  id: string
  business_id: string
  name: string
  schema: Array<{ name: string; label: string; type: string; required?: boolean }>
  created_at: string
  submissions?: [{ count: number }]
}

export async function listForms(businessId: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*, submissions(count)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Form[]
}

export async function getForm(id: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as Form
}

export async function createForm(
  businessId: string,
  name: string,
  schema: Form["schema"],
) {
  const { data, error } = await supabase
    .from("forms")
    .insert({ business_id: businessId, name, schema })
    .select("*")
    .single()
  if (error) throw error
  return data as Form
}
