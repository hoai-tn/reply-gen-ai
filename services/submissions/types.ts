export interface CreateSubmissionPayload {
  formId: string
  answers: Record<string, unknown>
  email?: string
  aiResponse?: string
}
