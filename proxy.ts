import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths"
import { LOCALE_COOKIE, prefixedLocales } from "@/lib/i18n/config"

const SESSION_COOKIE = "adp_session"
const PREFIXED: readonly string[] = prefixedLocales

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ---- staff sign in lives at a custom address; the internal route is not reachable directly ----
  if (pathname === ADMIN_LOGIN_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.rewrite(url)
  }
  if (pathname === "/admin/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/en/not-found"
    url.search = ""
    return NextResponse.rewrite(url, { status: 404 })
  }

  // ---- admin: optimistic session gate (the panel layout and the API verify for real) ----
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/logout") return NextResponse.next()
    if (!request.cookies.has(SESSION_COOKIE)) {
      const login = new URL(ADMIN_LOGIN_PATH, request.url)
      login.searchParams.set("next", pathname + search)
      return NextResponse.redirect(login)
    }
    return NextResponse.next()
  }

  // ---- languages: English has clean URLs, Filipino and Cebuano are prefixed ----
  const first = pathname.split("/")[1]
  if (PREFIXED.includes(first)) return NextResponse.next()

  if (first === "en") {
    // /en/fleet is served at /fleet, so keep a single canonical URL
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || "/"
    const response = NextResponse.redirect(url, 308)
    response.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
    return response
  }

  // returning visitors who chose another language go back to it
  const saved = request.cookies.get(LOCALE_COOKIE)?.value
  if (saved && PREFIXED.includes(saved)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${saved}${pathname === "/" ? "" : pathname}`
    return NextResponse.redirect(url)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === "/" ? "" : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // everything except Next internals, the API proxy, uploaded media, static files and metadata images
    "/((?!_next|api|media|images|AllDriveph-partners|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|logo-mark.png|.*opengraph-image).*)",
  ],
}
