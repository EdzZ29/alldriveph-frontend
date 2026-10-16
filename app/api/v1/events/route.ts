import type { NextRequest } from "next/server"

/**
 * Same origin entry to the API's live stream (Server-Sent Events) for the browser: chat messages
 * for the visitor's bubble, and new bookings, messages and chats for the admin panel. The session
 * cookie goes along, so staff streams stay authenticated without exposing the token.
 */

// 127.0.0.1, not localhost: on Windows "localhost" tries IPv6 first and adds ~200 ms to every call
const API_URL = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

export async function GET(request: NextRequest) {
  const headers = new Headers({ accept: "text/event-stream" })
  for (const name of ["cookie", "authorization", "x-forwarded-for"]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  let upstream: Response
  try {
    upstream = await fetch(`${API_URL}/api/v1/events${request.nextUrl.search}`, {
      headers,
      cache: "no-store",
      // the API stream ends as soon as the visitor leaves the page
      signal: request.signal,
    })
  } catch {
    // the browser's EventSource retries on its own once the API is back
    return new Response("API unavailable", { status: 503, headers: { "cache-control": "no-store" } })
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" },
    })
  }
  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      // no-transform keeps Next.js compression from buffering the stream
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  })
}
