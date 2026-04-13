function assert(value: string | undefined, key: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

/** Server-only — never import in client components.
 *  Uses getters so validation only runs when the value is actually accessed,
 *  not at module load time. */
export const serverEnv = {
  get openAiApiKey() {
    return assert(process.env.OPENAI_API_KEY, "OPENAI_API_KEY")
  },
  get supabaseServiceRoleKey() {
    return assert(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY"
    )
  },
}
