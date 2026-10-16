import type { Locale } from "@/lib/i18n/config"
import affiliate from "@/lib/i18n/messages/affiliate"
import blog from "@/lib/i18n/messages/blog"
import booking from "@/lib/i18n/messages/booking"
import branches from "@/lib/i18n/messages/branches"
import common from "@/lib/i18n/messages/common"
import contact from "@/lib/i18n/messages/contact"
import faq from "@/lib/i18n/messages/faq"
import fleet from "@/lib/i18n/messages/fleet"
import home from "@/lib/i18n/messages/home"
import legal from "@/lib/i18n/messages/legal"
import nav from "@/lib/i18n/messages/nav"
import partners from "@/lib/i18n/messages/partners"
import rates from "@/lib/i18n/messages/rates"
import services from "@/lib/i18n/messages/services"
import track from "@/lib/i18n/messages/track"

import es from "@/lib/i18n/messages/locales/es"
import ja from "@/lib/i18n/messages/locales/ja"
import ko from "@/lib/i18n/messages/locales/ko"
import zh from "@/lib/i18n/messages/locales/zh"

// English, Filipino and Cebuano sit side by side in one file per page area (messages/<area>.ts).
// The other languages have one file each with every area (messages/locales/<lang>.ts), typed
// against the English text so a missing or misspelled key fails the build.
const namespaces = { affiliate, blog, booking, branches, common, contact, faq, fleet, home, legal, nav, partners, rates, services, track }

export type Messages = { [K in keyof typeof namespaces]: (typeof namespaces)[K]["en"] }

type SideBySide = keyof (typeof namespaces)["common"]
const fullTranslations: Partial<Record<Locale, Messages>> = { es, ja, ko, zh }

const cache = new Map<Locale, Messages>()

export function getMessages(lang: Locale): Messages {
  let messages = cache.get(lang)
  if (!messages) {
    messages =
      fullTranslations[lang] ??
      (Object.fromEntries(Object.entries(namespaces).map(([key, value]) => [key, value[lang as SideBySide]])) as Messages)
    cache.set(lang, messages)
  }
  return messages
}
