import type { MetadataRoute } from "next"
import { connection } from "next/server"

import { api } from "@/lib/api"
import { branches } from "@/lib/branches"
import { htmlLang, localizePath, locales } from "@/lib/i18n/config"
import { absoluteUrl } from "@/lib/seo"

type Entry = { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number; lastModified?: string }

/** One sitemap entry per language, each listing its translations for hreflang. */
function localized(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], absoluteUrl(localizePath(l, path))]))
    return locales.map((lang) => ({
      url: absoluteUrl(localizePath(lang, path)),
      alternates: { languages },
      ...rest,
      // English is the primary version; translations rank just below it
      priority: lang === "en" ? rest.priority : Math.round(rest.priority * 0.9 * 10) / 10,
    }))
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // fleet and blog change at runtime, so build the sitemap per request
  await connection()

  const pages: Entry[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/fleet", changeFrequency: "daily", priority: 0.9 },
    { path: "/rates", changeFrequency: "weekly", priority: 0.9 },
    ...branches.map((b) => ({ path: `/car-rental/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    { path: "/services", changeFrequency: "monthly", priority: 0.7 },
    { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
    { path: "/affiliate", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/cookies-policy", changeFrequency: "yearly", priority: 0.2 },
  ]

  const { vehicles, posts } = await api.sitemap().catch(() => ({ vehicles: [], posts: { items: [] } }))

  return localized([
    ...pages,
    ...vehicles.map((v) => ({ path: `/fleet/${v.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.items.map((p) => ({
      path: `/blog/${p.slug}`,
      lastModified: p.published_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ])
}
