import { supabase } from "@/lib/supabase"
import { uploadFile, deleteFile } from "./storage"

export interface Document {
  id: string
  business_id: string
  name: string
  storage_path: string
  file_size: number
  disabled: boolean
  deleted_at: string | null
  created_at: string
  form_documents: { form_id: string }[]
}

export interface FormDocument {
  form_id: string
  document_id: string
  created_at: string
}

export async function listDocuments(businessId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*, form_documents(form_id)")
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Document[]
}

export async function listDocumentsByForm(formId: string) {
  const { data, error } = await supabase
    .from("form_documents")
    .select("document_id, documents(*)")
    .eq("form_id", formId)
  if (error) throw error
  return (data?.map((r) => r.documents) ?? []) as unknown as Document[]
}

export async function uploadDocument({
  businessId,
  formId,
  file,
}: {
  businessId: string
  formId: string | null
  file: File
}) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const storagePath = `${businessId}/${uniqueSuffix}-${file.name}`

  await uploadFile(storagePath, file)

  const { data, error } = await supabase
    .from("documents")
    .insert({
      business_id: businessId,
      name: file.name,
      storage_path: storagePath,
      file_size: file.size,
    })
    .select()
    .single()

  if (error) {
    await deleteFile(storagePath).catch(() => null)
    throw error
  }

  const doc = data as Document

  if (formId) {
    const { error: linkError } = await supabase
      .from("form_documents")
      .insert({ form_id: formId, document_id: doc.id })
    if (linkError) {
      await deleteFile(storagePath).catch(() => null)
      await supabase.from("documents").delete().eq("id", doc.id)
      throw linkError
    }
  }

  return doc
}

export async function getLinkedDocumentIds(formId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("form_documents")
    .select("document_id")
    .eq("form_id", formId)
  if (error) throw error
  return (data ?? []).map((r) => r.document_id)
}

export async function syncFormDocuments(
  formId: string,
  nextIds: string[],
  prevIds: string[],
) {
  const toAdd = nextIds.filter((id) => !prevIds.includes(id))
  const toRemove = prevIds.filter((id) => !nextIds.includes(id))

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("form_documents")
      .insert(toAdd.map((document_id) => ({ form_id: formId, document_id })))
    if (error) throw error
  }

  for (const document_id of toRemove) {
    const { error } = await supabase
      .from("form_documents")
      .delete()
      .eq("form_id", formId)
      .eq("document_id", document_id)
    if (error) throw error
  }
}

export async function linkDocumentToForm(documentId: string, formId: string) {
  const { error } = await supabase
    .from("form_documents")
    .insert({ form_id: formId, document_id: documentId })
  if (error) throw error
}

export async function unlinkDocumentFromForm(documentId: string, formId: string) {
  const { error } = await supabase
    .from("form_documents")
    .delete()
    .eq("form_id", formId)
    .eq("document_id", documentId)
  if (error) throw error
}

export async function deleteDocument(id: string, storagePath: string) {
  await supabase.from("documents").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  await deleteFile(storagePath).catch(() => null)
}
