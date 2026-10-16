import { Suspense } from "react"

import { ChatWidgetLoader } from "@/components/site/chat-widget-loader"
import { CookieConsent } from "@/components/site/cookie-consent"
import { AnnouncementBar, SiteHeader, SiteHeaderView } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { getI18n } from "@/lib/i18n/server"

export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const { t } = await getI18n()
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t.nav.skipToContent}
      </a>
      <AnnouncementBar />
      <Suspense fallback={<SiteHeaderView pathname="" />}>
        <SiteHeader />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieConsent />
      {/* the common questions come from the API; the bubble waits for them without holding up the page */}
      <Suspense fallback={null}>
        <ChatWidgetLoader />
      </Suspense>
    </>
  )
}
