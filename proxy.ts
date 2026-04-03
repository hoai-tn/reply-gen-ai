import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase-server"

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)

  const { pathname } = request.nextUrl

  // Validate the JWT server-side — never trust the client cookie alone
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log("User in proxy:", user)
  const isProtected = pathname.startsWith("/business")
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/business/dashboard"
    url.searchParams.delete("next")
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/business/:path*"],
}
