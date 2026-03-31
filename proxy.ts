import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase-server"

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // Authenticated users should not access auth pages — redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/auth/:path*"],
}
