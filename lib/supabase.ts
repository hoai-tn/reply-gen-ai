import { type SupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import { publicEnv } from "@/configs/app.config"

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      publicEnv.supabaseUrl,
      publicEnv.supabasePublishableKey
    )
  }
  return client
}

// Lazy-initialized singleton — safe for build/prerender (no env vars needed until runtime)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getSupabase()
    const value = Reflect.get(c, prop, receiver)
    return typeof value === "function" ? value.bind(c) : value
  },
})
