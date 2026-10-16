"use client"

import { createContext, use } from "react"

import { localizePath, type Locale } from "@/lib/i18n/config"
import type { Messages } from "@/lib/i18n/messages"

// Only the active language's messages reach the browser: the server layout passes them in.
const I18nContext = createContext<{ lang: Locale; t: Messages } | null>(null)

export function I18nProvider({ lang, messages, children }: { lang: Locale; messages: Messages; children: React.ReactNode }) {
  return <I18nContext value={{ lang, t: messages }}>{children}</I18nContext>
}

/** Like useI18n, but returns null outside the site (for components shared with the admin panel). */
export function useOptionalI18n() {
  const context = use(I18nContext)
  return context ? { ...context, href: (path: string) => localizePath(context.lang, path) } : null
}

/** Translations in Client Components: `const { t, lang, href } = useI18n()`. */
export function useI18n() {
  const context = use(I18nContext)
  if (!context) throw new Error("useI18n must be used inside I18nProvider")
  const { lang, t } = context
  return { lang, t, href: (path: string) => localizePath(lang, path) }
}
