import type { MetadataRoute } from "next"

import { prefixedLocales } from "@/lib/i18n/config"
import { absoluteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  // booking and tracking pages are private to each visitor, in every language
  const privatePaths = ["/book/", "/track", ...prefixedLocales.flatMap((l) => [`/${l}/book/`, `/${l}/track`])]
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", ...privatePaths] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
