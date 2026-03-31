import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export type PilotInfo = {
  id: string
  status: "requested" | "paid" | "activated" | "live" | "ended" | "archived"
  plan_type: string | null
  activated_at: string | null
}

export type BusinessInfo = {
  id: string
  name: string
  slug: string
  status: string
  industry_type: string | null
  website: string | null
}

export type MeData = {
  user: User
  session: Session
  business: BusinessInfo | null
}

const getMe = async (): Promise<MeData | null> => {
  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()])

  if (!user || !session) return null

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, status, industry_type, website, pilots(id, status, plan_type, activated_at)"
    )
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    user,
    session,
    business: business
      ? {
          id: business.id,
          name: business.name,
          slug: business.slug,
          status: business.status,
          industry_type: business.industry_type,
          website: business.website,
        }
      : null,
  }
}

const getUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

const getSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession()
  return session?.access_token ?? null
}

const refreshSession = async (): Promise<Session | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession()
  if (error) throw error
  return session
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
    return data
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone: phone || undefined,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/auth/verified`,
      },
    })

    if (error) {
      throw error
    }

    // Supabase returns a user with empty identities when the email
    // already exists (to prevent email enumeration attacks)
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists")
    }

    return data
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/new-password`,
  })
  if (error) throw error
}

const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export {
  getAccessToken,
  getMe,
  getSession,
  getUser,
  refreshSession,
  resetPassword,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updatePassword,
}
