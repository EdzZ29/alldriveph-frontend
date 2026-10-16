// Server Components only: reads the language from the [lang] root segment.
import { notFound } from "next/navigation"
import { lang as rootLang } from "next/root-params"

import { isLocale, localizePath, type Locale } from "@/lib/i18n/config"
import { getMessages } from "@/lib/i18n/messages"

export async function getLocale(): Promise<Locale> {
  const value = await rootLang()
  if (!isLocale(value)) notFound()
  return value
}

/** Translations for the current request: `const { t, lang, href } = await getI18n()`. */
export async function getI18n() {
  const lang = await getLocale()
  return { lang, t: getMessages(lang), href: (path: string) => localizePath(lang, path) }
}
