export interface DocumentQueryParams {
  businessId: string
  formId?: string
}

export interface CreateDocumentPayload {
  businessId: string
  formId: string
  name: string
}

export interface UpdateDocumentPayload {
  name?: string
}
