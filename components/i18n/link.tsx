"use client"

import NextLink from "next/link"

import { useOptionalI18n } from "@/components/i18n/provider"
import { prefixedLocales } from "@/lib/i18n/config"

// Pages whose main content depends on the URL (search params or a slug). Their App Shell alone
// would show a skeleton after the click, so links to them prefetch the cached content as well
// (per-link prefetching), and the page appears complete the moment it is clicked.
const URL_DATA_ROUTES = new RegExp(`^/(?:(?:${prefixedLocales.join("|")})/)?(?:fleet|blog|book/|car-rental/)`)

/** Drop-in replacement for next/link that keeps visitors in their chosen language. */
export default function Link({ href, prefetch, ...props }: React.ComponentProps<typeof NextLink>) {
  const i18n = useOptionalI18n()
  const target = i18n && typeof href === "string" ? i18n.href(href) : href
  const path = typeof target === "string" ? target : (target.pathname ?? "")
  return <NextLink href={target} prefetch={prefetch ?? (URL_DATA_ROUTES.test(path) ? true : undefined)} {...props} />
}
