// Shared by server and client code. English keeps the plain URLs (/fleet);
// other languages are prefixed (/fil/fleet, /ko/fleet).

export const locales = ["en", "fil", "ceb", "ko", "ja", "zh", "es"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
export const LOCALE_COOKIE = "adp_lang"

/** Languages with a URL prefix, i.e. every language except English. */
export const prefixedLocales = locales.filter((l) => l !== defaultLocale)

/**
 * How each language is shown in the picker: its own name, a short code for the header button, and
 * the country flag (an ISO 3166 code for components/i18n/flag.tsx).
 */
export const localeNames: Record<Locale, { label: string; short: string; region: string; flag: string }> = {
  en: { label: "English", short: "EN", region: "PH", flag: "US" },
  fil: { label: "Filipino", short: "FIL", region: "PH", flag: "PH" },
  ceb: { label: "Cebuano (Bisaya)", short: "CEB", region: "PH", flag: "PH" },
  ko: { label: "한국어", short: "KO", region: "KR", flag: "KR" },
  ja: { label: "日本語", short: "JA", region: "JP", flag: "JP" },
  zh: { label: "简体中文", short: "中文", region: "CN", flag: "CN" },
  es: { label: "Español", short: "ES", region: "ES", flag: "ES" },
}

/** BCP 47 tags for <html lang>, hreflang and Open Graph */
export const htmlLang: Record<Locale, string> = {
  en: "en-PH",
  fil: "fil-PH",
  ceb: "ceb-PH",
  ko: "ko",
  ja: "ja",
  zh: "zh-Hans",
  es: "es",
}
export const ogLocale: Record<Locale, string> = {
  en: "en_PH",
  fil: "fil_PH",
  ceb: "ceb_PH",
  ko: "ko_KR",
  ja: "ja_JP",
  zh: "zh_CN",
  es: "es_ES",
}

/** Intl formatting locale. Cebuano has no full ICU data, and Filipinos read English dates fine. */
export const intlLocale: Record<Locale, string> = {
  en: "en-PH",
  fil: "fil-PH",
  ceb: "en-PH",
  ko: "ko-KR",
  ja: "ja-JP",
  zh: "zh-CN",
  es: "es-ES",
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

const UNLOCALIZED = /^\/(admin|api|media|images)(\/|$)/

/** Adds the language prefix to an internal path: ("fil", "/fleet") -> "/fil/fleet". */
export function localizePath(lang: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || UNLOCALIZED.test(path)) return path
  if (lang === defaultLocale) return path
  return path === "/" ? `/${lang}` : `/${lang}${path}`
}

const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`)

/** Removes a language prefix: "/fil/fleet" -> "/fleet". */
export function stripLocale(pathname: string) {
  const match = pathname.match(LOCALE_PREFIX)
  if (!match) return pathname
  return pathname.slice(match[0].length) || "/"
}

/** Canonical and hreflang links for one page, used in generateMetadata. */
export function alternatesFor(lang: Locale, path: string) {
  return {
    canonical: localizePath(lang, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [htmlLang[l], localizePath(l, path)])),
      "x-default": path,
    },
  }
}

/** Fills "{name}" placeholders: fmt("Cars in {city}", { city: "CDO" }). */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}
