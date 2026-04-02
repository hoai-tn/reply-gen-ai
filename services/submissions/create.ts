import { supabaseServer } from "@/lib/supabase-server"
import type { CreateSubmissionPayload } from "./types"

export async function createSubmission(payload: CreateSubmissionPayload) {
  const client = supabaseServer()
  const { data, error } = await client
    .from("submissions")
    .insert([{
      form_id: payload.formId,
      answers: payload.answers,
      email: payload.email,
      ai_response: payload.aiResponse,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}
