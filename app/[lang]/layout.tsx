import type { Metadata, Viewport } from "next"

import { I18nProvider } from "@/components/i18n/provider"
import { Providers } from "@/components/providers"
import { fontVariables } from "@/lib/fonts"
import { alternatesFor, htmlLang, locales, ogLocale } from "@/lib/i18n/config"
import { getMessages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import { site } from "@/lib/site"
import "../globals.css"

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  const t = getMessages(lang).common.meta
  return {
    metadataBase: new URL(site.url),
    title: { default: t.title, template: `%s | ${site.name}` },
    description: t.description,
    applicationName: site.name,
    keywords: t.keywords,
    alternates: alternatesFor(lang, "/"),
    openGraph: {
      type: "website",
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      siteName: site.name,
      title: site.name,
      description: t.description,
    },
    twitter: { card: "summary_large_image", title: site.name, description: t.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1120" },
    { media: "(prefers-color-scheme: dark)", color: "#070b14" },
  ],
}

export default async function LocaleLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLocale()
  return (
    <html lang={htmlLang[lang]} suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <I18nProvider lang={lang} messages={getMessages(lang)}>
            {children}
          </I18nProvider>
        </Providers>
      </body>
    </html>
  )
}
