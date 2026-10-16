import { ArrowRightIcon, CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { CtaBanner } from "@/components/site/cta-banner"
import { ServiceIcon } from "@/components/site/icons"
import { RentalOptions } from "@/components/site/rental-options"
import { PageHeader } from "@/components/site/page-header"
import { CardGridSkeleton } from "@/components/site/skeletons"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { peso } from "@/lib/format"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.services.meta.title, description: t.services.meta.description, alternates: alternatesFor(lang, "/services") }
}

async function ServiceList() {
  const { t } = await getI18n()
  const s = t.services
  const result = await safeLoad(api.services)
  if (result.error) return <ApiErrorState />
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {result.data.map((service) => (
        <article id={service.slug} key={service.id} className="scroll-mt-24 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-brand-strong">
              <ServiceIcon name={service.icon} className="size-5.5" />
            </span>
            <span className="rounded-full border px-3 py-1 text-sm font-medium">
              {service.price_from ? fmt(s.priceFrom, { price: peso(service.price_from) }) : s.customQuote}
            </span>
          </div>
          <h2 className="mt-6 text-2xl font-semibold">{service.title}</h2>
          <p className="mt-2 text-lg text-muted-foreground">{service.summary}</p>
          {service.description && <p className="mt-4 leading-relaxed text-muted-foreground">{service.description}</p>}
          {service.highlights.length > 0 && (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {service.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/fleet">
                {s.chooseCar} <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/contact?subject=${encodeURIComponent(service.title)}`}>{s.askQuestion}</Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default async function ServicesPage() {
  const { t } = await getI18n()
  return (
    <>
      <PageHeader
        eyebrow={t.services.header.eyebrow}
        title={t.services.header.title}
        description={t.services.header.description}
      />
      <section className="container-page pt-14 sm:pt-20">
        <RentalOptions />
      </section>
      <section className="container-page py-14 sm:py-20">
        <Suspense fallback={<CardGridSkeleton count={4} className="lg:grid-cols-2" />}>
          <ServiceList />
        </Suspense>
      </section>
      <CtaBanner />
    </>
  )
}
