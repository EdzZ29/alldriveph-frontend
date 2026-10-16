import { ArrowRightIcon, CheckIcon, ClockIcon, MapPinIcon, PlaneIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Reveal } from "@/components/motion/reveal"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { CtaBanner } from "@/components/site/cta-banner"
import { SectionHeading } from "@/components/site/page-header"
import { SearchSkeleton, VehicleGridSkeleton } from "@/components/site/skeletons"
import { TripSearch } from "@/components/site/trip-search"
import { VehicleCard } from "@/components/site/vehicle-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { branches, getBranch, type Branch } from "@/lib/branches"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import type { Messages } from "@/lib/i18n/messages"
import { getI18n } from "@/lib/i18n/server"
import { breadcrumbSchema, branchSchema, faqSchema, JsonLd } from "@/lib/seo"
import { site } from "@/lib/site"

/** Branch content in the visitor's language; trip names are place names and stay as written. */
function localBranch(t: Messages, branch: Branch) {
  const text = t.branches.content[branch.slug]
  if (!text) return branch
  return {
    ...branch,
    intro: text.intro,
    airport: { ...branch.airport, note: text.airportNote },
    trips: branch.trips.map((trip, i) => ({ ...trip, ...text.trips[i] })),
    faqs: text.faqs,
  }
}

export function generateStaticParams() {
  return branches.map((b) => ({ city: b.slug }))
}

export async function generateMetadata({ params }: PageProps<"/[lang]/car-rental/[city]">): Promise<Metadata> {
  const branch = getBranch((await params).city)
  if (!branch) return {}
  const { t, lang } = await getI18n()
  const title = fmt(t.branches.metaTitle, { city: branch.shortCity })
  const description = fmt(t.branches.metaDescription, { city: branch.city, airport: branch.airport.name })
  return {
    title,
    description,
    keywords: branch.keywords,
    alternates: alternatesFor(lang, `/car-rental/${branch.slug}`),
    openGraph: { title: `${title} | ${site.name}`, description, url: `/car-rental/${branch.slug}` },
  }
}

async function BranchSearch({ branch }: { branch: Branch }) {
  const { data } = await safeLoad(api.meta)
  return <TripSearch locations={data?.locations ?? []} branch={branch.slug} />
}

async function BranchFleet({ branch }: { branch: Branch }) {
  const result = await safeLoad(() => api.vehicles({ sort: "recommended", branch: branch.slug }))
  if (result.error) return <ApiErrorState />
  const query = new URLSearchParams({ location: branch.locationCodes[0] }).toString()
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.slice(0, 6).map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} query={query} />
      ))}
    </div>
  )
}

export default async function BranchPage({ params }: PageProps<"/[lang]/car-rental/[city]">) {
  const base = getBranch((await params).city)
  if (!base) notFound()
  const { t } = await getI18n()
  const c = t.branches
  const branch = localBranch(t, base)
  const others = branches.filter((b) => b.slug !== branch.slug)
  const [moreBefore, moreAfter] = c.moreAnswers.split("{link}")

  return (
    <>
      <JsonLd
        data={[
          branchSchema(branch),
          faqSchema(branch.faqs),
          breadcrumbSchema([
            { name: t.blog.breadcrumbHome, path: "/" },
            { name: fmt(c.carRental, { city: branch.shortCity }), path: `/car-rental/${branch.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden bg-ink pb-16 text-ink-foreground">
        <div className="hero-glow animate-drift pointer-events-none absolute inset-0" aria-hidden />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="container-page relative space-y-8 pt-10 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
            <Link href="/" className="hover:text-white">
              {t.blog.breadcrumbHome}
            </Link>{" "}
            / <span className="text-white">{fmt(c.carRental, { city: branch.shortCity })}</span>
          </nav>
          <Reveal className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-ink-muted">
              <MapPinIcon className="size-3.5 text-primary" /> {branch.city}, {branch.province}
            </span>
            <h1 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-tighter text-white sm:text-7xl">
              {c.heading} <span className="text-gradient">{branch.shortCity}.</span>
            </h1>
            <p className="text-lg leading-relaxed text-ink-muted">{branch.intro}</p>
          </Reveal>
          <Suspense fallback={<SearchSkeleton />}>
            <BranchSearch branch={branch} />
          </Suspense>
        </div>
      </section>

      <section className="container-page grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <MapPinIcon className="size-5 text-brand-strong" />
          <h2 className="mt-4 font-sans text-base font-semibold">{c.cityPickup}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {branch.city}, {branch.province} {branch.postalCode}. {c.cityPickupBody}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <PlaneIcon className="size-5 text-brand-strong" />
          <h2 className="mt-4 font-sans text-base font-semibold">
            {branch.airport.name} ({branch.airport.code})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{fmt(c.airportBody, { note: branch.airport.note })}</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:col-span-2 lg:col-span-1">
          <ClockIcon className="size-5 text-brand-strong" />
          <h2 className="mt-4 font-sans text-base font-semibold">{c.openDaily}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.nav.footer.hours}. {t.contact.channels.hotline}.
          </p>
        </div>
      </section>

      <section className="container-page pb-20">
        <SectionHeading
          eyebrow={fmt(c.availableIn, { city: branch.shortCity })}
          title={fmt(c.carsFor, { city: branch.shortCity })}
          description={c.carsDescription}
          action={
            <Button asChild variant="outline" size="xl">
              <Link href={`/fleet?location=${branch.locationCodes[0]}`}>
                {c.seeAll} <ArrowRightIcon />
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <Suspense fallback={<VehicleGridSkeleton />}>
            <BranchFleet branch={branch} />
          </Suspense>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="container-page py-20">
          <SectionHeading eyebrow={c.tripsEyebrow} title={fmt(c.tripsTitle, { city: branch.shortCity })} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {branch.trips.map((trip) => (
              <article key={trip.name} className="rounded-2xl border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{trip.name}</h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-brand-strong">{trip.drive}</span>
                </div>
                <p className="mt-2 leading-relaxed text-muted-foreground">{trip.text}</p>
                <p className="mt-4 flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-success" /> {fmt(c.recommended, { car: trip.car })}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-brand-strong">{c.faqEyebrow}</p>
          <h2 className="text-3xl font-semibold">{fmt(c.faqTitle, { city: branch.shortCity })}</h2>
          <p className="text-muted-foreground">
            {moreBefore}
            <Link href="/faq" className="font-medium text-foreground underline underline-offset-4">
              {c.faqLink}
            </Link>
            {moreAfter}
          </p>
          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium">{c.others}</p>
            {others.map((b) => (
              <Link key={b.slug} href={`/car-rental/${b.slug}`} className="flex items-center gap-1.5 text-sm text-brand-strong hover:underline">
                {fmt(c.carRental, { city: b.shortCity })} <ArrowRightIcon className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
          {branch.faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="py-5 text-base">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <CtaBanner />
    </>
  )
}
