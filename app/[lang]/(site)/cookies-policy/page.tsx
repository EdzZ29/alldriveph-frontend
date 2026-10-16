import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-page"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { site } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.legal.cookies.title, description: t.legal.cookies.metaDescription, alternates: alternatesFor(lang, "/cookies-policy") }
}

const content = `
This policy explains how ${site.name} uses cookies and similar technologies on our website, and how you can manage your preferences. It should be read together with our [privacy policy](/privacy-policy).

## What are cookies?

Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences, keep you signed in, and understand how the site is used. Similar technologies include local storage, which works in a comparable way.

## Cookies we use

**Strictly necessary**

These cookies are required for the website to work and cannot be switched off.

| Name | Purpose | Duration |
| --- | --- | --- |
| adp_cookie_consent | Remembers your cookie choice | 6 months |
| adp_session | Keeps staff signed in to the admin panel | 12 hours |
| theme | Remembers light or dark mode (local storage) | Until cleared |

**Analytics (optional)**

If you choose "Accept all", we may use privacy friendly analytics to understand which pages are visited and how people find us. This data is aggregated and is not used to identify you. Analytics cookies are never set if you choose "Essential only".

We do not use advertising or cross site tracking cookies.

## Managing your preferences

When you first visit our site, a banner lets you accept all cookies or only essential ones. To change your choice later, clear the cookies for this site in your browser settings and the banner will appear again on your next visit.

Most browsers also let you block or delete cookies:

- [Google Chrome](https://support.google.com/chrome/answer/95647)
- [Mozilla Firefox](https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox)
- [Safari](https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac)
- [Microsoft Edge](https://support.microsoft.com/microsoft-edge)

Blocking strictly necessary cookies may cause parts of the site, such as the admin panel, to stop working.

## Changes to this policy

We may update this policy when we change the cookies we use. The date at the top of this page shows when it was last updated.

## Contact us

Questions about cookies? Email [${site.email}](mailto:${site.email}) or call ${site.phone}.
`

export default async function CookiesPolicyPage() {
  const { t } = await getI18n()
  return (
    <LegalPage title={t.legal.cookies.title} description={t.legal.cookies.description} updated="2026-10-15" content={content} />
  )
}
