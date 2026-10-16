// Browser side API client. Requests go to /api/v1/rpc on the same origin and are proxied to the
// NestJS backend by the rewrite in next.config.ts, so the httpOnly session cookie works without
// any CORS setup.
//
// The whole API is that one endpoint. Name the operations you want with their arguments and the
// answer has exactly those keys:
//
//   rpc({ meta: {}, vehicles: { branch: "davao" } })  ->  { meta: {...}, vehicles: [...] }
//   call("quote", trip)                               ->  the quote itself
//
// Any failure is thrown as an ApiError with the HTTP status, a message to show, and for invalid
// input the list of bad fields.

import type { ApiErrorBody, ApiFieldError } from "@/lib/types"

const ENDPOINT = "/api/v1/rpc"

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status from the API (401 signed out, 409 conflict, 422 invalid input...) */
    public status: number,
    public errors: ApiFieldError[] = [],
    public code?: string
  ) {
    super(message)
  }
}

const TOO_MANY = "Too many attempts. Please wait a moment and try again."
const GENERIC = "Something went wrong. Please try again."

async function send<T>(init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(ENDPOINT, { method: "POST", credentials: "same-origin", ...init })
  } catch {
    throw new ApiError("We could not reach the server. Check your connection and try again.", 0)
  }

  const body = (await res.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null
  if (res.ok && body && !body.error) return body

  const error = body?.error
  const status = error?.status ?? res.status
  if (!error) {
    // no JSON from the API: the site's proxy could not reach it (502/503/504 or a 500 page)
    throw new ApiError(
      status === 429 ? TOO_MANY : status >= 500 ? "The booking server is not responding. Please try again in a moment." : GENERIC,
      status
    )
  }
  // 503/504 come from the site's own proxy with a message meant for visitors
  const message =
    status === 429 ? TOO_MANY : error.code === "SERVICE_UNAVAILABLE" || status < 500 ? error.message : GENERIC
  throw new ApiError(message, status, error.errors ?? [], error.code)
}

/** Runs several operations in one request and returns their results keyed by name. */
export function rpc<T extends Record<string, unknown>>(operations: Record<string, unknown>): Promise<T> {
  return send<T>({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(operations),
  })
}

/** Runs one operation and returns its result. */
export async function call<T = unknown>(operation: string, args: Record<string, unknown> = {}): Promise<T> {
  const data = await rpc<Record<string, T>>({ [operation]: args })
  return data[operation]
}

/** Uploads an image (multipart/form-data to the same endpoint) and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const data = await send<{ upload_image: { url: string } }>({ headers: { accept: "application/json" }, body: form })
  return data.upload_image.url
}
