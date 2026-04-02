import { supabase } from "@/lib/supabase"

const BUCKET = "documents"

export async function uploadFile(path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false })
  if (error) throw error
  return data
}

export async function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
