import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { ContactForm } from "@/components/site/contact-form"
import { PageHeader } from "@/components/site/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { upcomingBranches } from "@/lib/branches"
import { site } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.contact.meta.title, description: t.contact.meta.description, alternates: alternatesFor(lang, "/contact") }
}


export default async function ContactPage() {
  const { t } = await getI18n()
  const c = t.contact
  const channels = [
    { icon: PhoneIcon, label: c.channels.callOrText, value: site.phone, href: site.phoneHref },
    { icon: MailIcon, label: c.channels.email, value: site.email, href: `mailto:${site.email}` },
    { icon: MapPinIcon, label: c.channels.mainOffice, value: site.address },
    { icon: ClockIcon, label: c.channels.hours, value: t.nav.footer.hours },
    { icon: ShieldCheckIcon, label: c.channels.emergencies, value: c.channels.hotline },
  ]
  return (
    <>
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description} />
      <section className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_360px]">
        <Suspense fallback={<Skeleton className="h-[480px] rounded-2xl" />}>
          <ContactForm />
        </Suspense>
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t.nav.footer.ourBranches}</p>
            <ul className="mt-3 space-y-3">
              {site.branches.map((branch) => (
                <li key={branch.name} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <span>
                    <span className="block font-medium">{branch.name}</span>
                    <span className="block text-sm text-muted-foreground">{c.branchAreas[branch.name] ?? branch.area}</span>
                  </span>
                </li>
              ))}
              {upcomingBranches.map((branch) => (
                <li key={branch.slug} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full border border-primary" />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-medium">
                      {branch.shortCity}
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-brand-strong uppercase">{t.common.badges.soon}</span>
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {branch.city}, {branch.province}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {channels.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand-strong">
                <Icon className="size-4.5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                {href ? (
                  <a href={href} className="font-medium hover:text-brand-strong">
                    {value}
                  </a>
                ) : (
                  <p className="font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </aside>
      </section>
    </>
  )
}
