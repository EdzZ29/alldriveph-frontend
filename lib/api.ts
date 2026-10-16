// Server side data access for public pages. Runs only in Server Components.
//
// Catalog data (fleet, blog, services...) is cached with "use cache" so pages render from memory
// instead of calling the API on every visit. The API pings /api/revalidate after an admin edit,
// which expires the matching tag; the "hours" lifetime is only a safety net if that ping is missed.
// Availability searches are never cached because they change with every booking.
//
// The API is one endpoint, POST /api/v1/rpc: the body names the operations a page needs, each with
// its arguments, and the answer carries exactly those keys. See lib/client-api.ts for the format.
import { cacheLife, cacheTag } from "next/cache"
import { unstable_rethrow } from "next/navigation"

import type { ApiErrorBody, BlogPost, BlogPostSummary, Faq, Meta, Page, Partner, Service, Vehicle, VehicleSummary } from "@/lib/types"

// 127.0.0.1, not localhost: on Windows "localhost" tries IPv6 first and adds ~200 ms to every call
const API_URL = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
const ENDPOINT = `${API_URL}/api/v1/rpc`

/** Tags the API may expire. Keep in sync with CacheTag in the backend revalidate.service.ts. */
export const CACHE_TAGS = ["meta", "vehicles", "blog", "services", "partners", "faqs"] as const
export type CacheTag = (typeof CACHE_TAGS)[number]

/** Every message starts with "API " so the error is recognisable after crossing a cache boundary. */
export class ApiUnavailableError extends Error {
  name = "ApiUnavailableError"
}

type Operations = Record<string, Record<string, unknown>>

// the API restarts for a second or two on every save in watch mode; ride that out quietly
const RETRY_DELAYS_MS = [250, 750]
const RETRYABLE = new Set(["ECONNREFUSED", "ECONNRESET", "EPIPE", "UND_ERR_SOCKET"])

/** The system error code of a failed fetch, e.g. "ECONNREFUSED", found on the error or its causes. */
export function networkCode(error: unknown): string | undefined {
  for (let e = error as { code?: unknown; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (typeof e.code === "string") return e.code
  }
  return undefined
}

async function request<T>(operations: Operations): Promise<T> {
  let res: Response | undefined
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify(operations),
        signal: AbortSignal.timeout(10_000),
      })
      break
    } catch (error) {
      // let Next.js prerender aborts and similar internal signals through untouched
      unstable_rethrow(error)
      const code = networkCode(error) ?? (error instanceof Error ? error.name : "network error")
      if (RETRYABLE.has(code) && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        continue
      }
      throw new ApiUnavailableError(`API unreachable at ${API_URL} (${code})`, { cause: error })
    }
  }
  const body = (await res.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null
  if (!res.ok || !body || body.error) {
    const reason = body?.error ? `${body.error.op ?? "request"}: ${body.error.message}` : `HTTP ${res.status}`
    throw new ApiUnavailableError(`API error (${reason})`)
  }
  return body
}

type Outcome<T> = { ok: true; data: T } | { ok: false; message: string }

/**
 * The cached part of a read. It never throws: Next.js reports any error thrown inside "use cache"
 * on its own (and fails prerenders on it) even when the caller catches it. A failure is returned
 * with a zero lifetime instead, so it is left out of prerendered pages, never reused, and the next
 * visit asks the API again.
 */
async function cachedOutcome<T>(tags: CacheTag[], operations: Operations): Promise<Outcome<T>> {
  "use cache"
  cacheTag(...tags)
  try {
    const data = await request<T>(operations)
    cacheLife("hours")
    return { ok: true, data }
  } catch (error) {
    unstable_rethrow(error)
    cacheLife({ stale: 0, revalidate: 0, expire: 0 })
    return { ok: false, message: error instanceof Error ? error.message : String(error) }
  }
}

/** A cached API read. Failures throw here, outside the cache, for safeLoad to catch. */
async function cachedRequest<T>(tags: CacheTag[], operations: Operations): Promise<T> {
  const outcome = await cachedOutcome<T>(tags, operations)
  if (!outcome.ok) throw new ApiUnavailableError(outcome.message)
  return outcome.data
}

const lastLogged = new Map<string, number>()

/**
 * Logs a failed API read as one short line, at most once every 30 seconds per message, so a page
 * with several sections does not flood the terminal while the API is down. Other errors keep
 * their full stack.
 */
export function reportApiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (!message.startsWith("API ")) {
    console.error(error)
    return
  }
  const now = Date.now()
  if (now - (lastLogged.get(message) ?? 0) < 30_000) return
  lastLogged.set(message, now)
  const hint = message.startsWith("API unreachable")
    ? " Start it with: cd alldriveph-backend && npm run start:dev (or `npm run dev` in the project root)"
    : ""
  console.warn(`[api] ${message}. Pages show a friendly error until it is back.${hint}`)
}

export type VehicleFilters = {
  category?: string
  transmission?: string
  min_seats?: string
  q?: string
  sort?: string
  available_from?: string
  available_to?: string
  featured?: string
  branch?: string
}

function vehicleArgs({ sort, min_seats, featured, ...rest }: VehicleFilters): Record<string, unknown> {
  const args: Record<string, unknown> = {}
  // sorted keys keep one cache entry per distinct filter set
  for (const key of Object.keys(rest).sort() as (keyof typeof rest)[]) {
    if (rest[key]) args[key] = rest[key]
  }
  const seats = Number(min_seats)
  if (min_seats && Number.isInteger(seats)) args.min_seats = seats
  if (featured === "true" || featured === "false") args.featured = featured === "true"
  args.sort = sort || "recommended"
  return args
}

export const api = {
  meta: async () => (await cachedRequest<{ meta: Meta }>(["meta"], { meta: {} })).meta,

  vehicles: async (filters: VehicleFilters = {}): Promise<VehicleSummary[]> => {
    const operations = { vehicles: vehicleArgs(filters) }
    // a date search reflects live bookings, so it always goes to the API
    const live = filters.available_from || filters.available_to
    const data = live
      ? await request<{ vehicles: VehicleSummary[] }>(operations)
      : await cachedRequest<{ vehicles: VehicleSummary[] }>(["vehicles"], operations)
    return data.vehicles
  },

  vehicle: async (slug: string) =>
    (await cachedRequest<{ vehicle: Vehicle | null }>(["vehicles"], { vehicle: { slug } })).vehicle,

  services: async () => (await cachedRequest<{ services: Service[] }>(["services"], { services: {} })).services,

  partners: async () => (await cachedRequest<{ partners: Partner[] }>(["partners"], { partners: {} })).partners,

  faqs: async () => (await cachedRequest<{ faqs: Faq[] }>(["faqs"], { faqs: {} })).faqs,

  posts: async (page = 1, pageSize = 9, tag?: string) =>
    (
      await cachedRequest<{ posts: Page<BlogPostSummary> }>(["blog"], {
        posts: { page, page_size: pageSize, tag: tag ?? null },
      })
    ).posts,

  post: async (slug: string) => (await cachedRequest<{ post: BlogPost | null }>(["blog"], { post: { slug } })).post,

  /** What sitemap.xml needs, fleet and blog in one request. */
  sitemap: () =>
    cachedRequest<{ vehicles: VehicleSummary[]; posts: Page<BlogPostSummary> }>(["vehicles", "blog"], {
      vehicles: {},
      posts: { page_size: 100 },
    }),
}
