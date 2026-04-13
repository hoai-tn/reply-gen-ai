function assert(value: string | undefined, key: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

// NEXT_PUBLIC_* must be accessed as literals — Next.js inlines them statically at build time.
// Dynamic bracket access (process.env[key]) does NOT work for client bundles.

/** Safe for client + server */
export const publicEnv = {
  supabaseUrl: assert(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ),
  supabasePublishableKey: assert(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
  ),
} as const
