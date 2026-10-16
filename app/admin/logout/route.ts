import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths"

// Clears a stale or invalid session cookie, then sends the user to the login page.
export async function GET(request: NextRequest) {
  const store = await cookies()
  store.delete("adp_session")
  const login = new URL(ADMIN_LOGIN_PATH, request.url)
  const next = request.nextUrl.searchParams.get("next")
  if (next?.startsWith("/admin")) login.searchParams.set("next", next)
  return NextResponse.redirect(login)
}
