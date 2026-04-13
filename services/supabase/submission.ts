import { supabase } from "@/lib/supabase"

export interface CreateSubmissionPayload {
  formId: string
  answers: Record<string, unknown>
  email?: string
  aiResponse?: string
}

export async function listSubmissions(formId: string) {
  const client = supabase
  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function createSubmission(payload: CreateSubmissionPayload) {
  const client = supabase
  const { data, error } = await client
    .from("submissions")
    .insert([
      {
        form_id: payload.formId,
        answers: payload.answers,
        email: payload.email,
        ai_response: payload.aiResponse,
      },
    ])
    .select()
    .single()
  if (error) throw error
  return data
}
