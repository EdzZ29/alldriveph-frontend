import { timingSafeEqual } from "node:crypto"

import { revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

import { CACHE_TAGS, type CacheTag } from "@/lib/api"

/**
 * Called by the API after an admin saves a change, so the public site drops that cached data:
 *   POST /api/revalidate  { "tags": ["vehicles"] }  with header x-revalidate-secret
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const given = request.headers.get("x-revalidate-secret") ?? ""
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return NextResponse.json({ detail: "Not allowed" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is CacheTag => CACHE_TAGS.includes(t as CacheTag)) : []
  if (!tags.length) return NextResponse.json({ detail: "No known tags" }, { status: 400 })

  // expire now: staff should see their edit on the next page load, not one visit later
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  return NextResponse.json({ revalidated: tags })
}
