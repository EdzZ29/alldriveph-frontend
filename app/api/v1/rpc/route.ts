import { NextResponse, type NextRequest } from "next/server"

import { networkCode, reportApiError } from "@/lib/api"
import type { ApiErrorBody } from "@/lib/types"

/**
 * Same origin entry to the API for the browser: POST /api/v1/rpc is forwarded to the NestJS
 * backend, so the admin session cookie stays first party and httpOnly with no CORS setup.
 *
 * A route handler rather than a rewrite, so that while the API restarts the request is retried
 * briefly, and when it is down the browser gets a clear JSON error instead of a bare 500.
 */

// 127.0.0.1, not localhost: on Windows "localhost" tries IPv6 first and adds ~200 ms to every call
const API_URL = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
const ENDPOINT = `${API_URL}/api/v1/rpc`

const REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "cookie",
  "user-agent",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-request-id",
]
const RESPONSE_HEADERS = ["content-type", "x-request-id"]

// only a refused connection is retried: the request never reached the API, so a booking or a
// contact message cannot be sent twice
const RETRY_DELAYS_MS = [300, 900]

export async function POST(request: NextRequest) {
  const body = await request.arrayBuffer()
  const headers = new Headers()
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      })
      const out = new Headers({ "cache-control": "no-store" })
      for (const name of RESPONSE_HEADERS) {
        const value = res.headers.get(name)
        if (value) out.set(name, value)
      }
      for (const cookie of res.headers.getSetCookie()) out.append("set-cookie", cookie)
      return new Response(res.body, { status: res.status, headers: out })
    } catch (error) {
      const code = networkCode(error) ?? (error instanceof Error ? error.name : "network error")
      if (code === "ECONNREFUSED" && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        continue
      }
      reportApiError(new Error(`API unreachable at ${API_URL} (${code})`))
      const status = code === "TimeoutError" ? 504 : 503
      const payload: ApiErrorBody = {
        error: {
          op: null,
          message: "The booking server is not responding. Please try again in a moment.",
          code: "SERVICE_UNAVAILABLE",
          status,
        },
      }
      return NextResponse.json(payload, { status, headers: { "cache-control": "no-store" } })
    }
  }
}
