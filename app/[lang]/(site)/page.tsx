import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CarFrontIcon,
  HeadsetIcon,
  KeyRoundIcon,
  MapPinnedIcon,
  ReceiptTextIcon,
  SparklesIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { Hero } from "@/components/home/hero"
import { FaqPreview, FleetSection, HeroSearch, LatestPosts, PartnersStrip, RatesPreview, ServicesPreview } from "@/components/home/sections"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { CtaBanner } from "@/components/site/cta-banner"
import { SectionHeading } from "@/components/site/page-header"
import { RentalOptions } from "@/components/site/rental-options"
import { CardGridSkeleton, SearchSkeleton, VehicleGridSkeleton } from "@/components/site/skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { branches, upcomingBranches } from "@/lib/branches"
import { branchSchema, JsonLd, organizationSchema } from "@/lib/seo"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { site } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n()
  return { alternates: alternatesFor(lang, "/") }
}

const valuePropIcons = [SparklesIcon, ReceiptTextIcon, HeadsetIcon, MapPinnedIcon]

const stepIcons = [CarFrontIcon, BadgeCheckIcon, KeyRoundIcon]

export default async function HomePage() {
  const { t } = await getI18n()
  const h = t.home
  const valueProps = h.valueProps.map((v, i) => ({ ...v, icon: valuePropIcons[i] }))
  const steps = h.how.steps.map((s, i) => ({ ...s, icon: stepIcons[i] }))

  return (
    <>
      <JsonLd data={[...organizationSchema(), ...branches.map(branchSchema)]} />
      <Hero />

      {/* Instant quote */}
      <section id="quote" className="relative z-10 -mt-14 scroll-mt-28 px-3">
        <Reveal className="mx-auto max-w-6xl rounded-[2rem] border bg-card p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-strong uppercase">{h.quote.eyebrow}</p>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">{h.quote.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{h.quote.description}</p>
          </div>
          <Suspense fallback={<SearchSkeleton />}>
            <HeroSearch />
          </Suspense>
        </Reveal>
        <Stagger className="mx-auto mt-8 grid max-w-6xl gap-6 px-2 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-brand-strong">
                <Icon className="size-4.5" />
              </span>
              <div>
                <h3 className="font-sans text-sm font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 01 Fleet */}
      <section className="dot-grid-light mt-24 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            index="01"
            eyebrow={h.fleet.eyebrow}
            title={
              <>
                {h.fleet.titleLine1}
                <br />
                {h.fleet.titleLine2}
              </>
            }
            description={h.fleet.description}
            action={
              <Button asChild variant="outline" size="xl" className="rounded-full">
                <Link href="/fleet">
                  {h.fleet.action} <ArrowRightIcon />
                </Link>
              </Button>
            }
          />
          <div className="mt-12">
            <Suspense fallback={<VehicleGridSkeleton count={8} className="xl:grid-cols-4" />}>
              <FleetSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 02 Rental options */}
      <section className="container-page py-20 sm:py-28">
        <SectionHeading
          align="center"
          index="02"
          eyebrow={h.options.eyebrow}
          title={h.options.title}
          description={h.options.description}
        />
        <RentalOptions className="mt-14" />
      </section>

      {/* 03 Rates */}
      <section className="bg-muted/40 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            align="center"
            index="03"
            eyebrow={h.rates.eyebrow}
            title={
              <>
                {h.rates.titleLine1}
                <br />
                {h.rates.titleLine2}
              </>
            }
            description={h.rates.description}
          />
          <div className="mt-14">
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-[1.75rem]" />}>
              <RatesPreview />
            </Suspense>
          </div>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link href="/rates#zones">
                {h.rates.action} <ArrowUpRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 04 Branches */}
      <section className="container-page py-20 sm:py-28">
        <SectionHeading
          index="04"
          eyebrow={h.branches.eyebrow}
          title={h.branches.title}
          description={h.branches.description}
        />
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3" gap={0.1}>
          {branches.map((branch, i) => (
            <StaggerItem key={branch.slug}>
              <Link
                href={`/car-rental/${branch.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-ink p-7 text-ink-foreground transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="hero-glow pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <span className="relative font-heading text-6xl font-extrabold text-white/10">0{i + 1}</span>
                <h3 className="relative mt-6 font-heading text-2xl font-bold tracking-tight text-white">{branch.shortCity}</h3>
                <p className="relative mt-1 text-sm text-ink-muted">
                  {branch.city}, {branch.province}
                </p>
                <p className="relative mt-4 text-sm text-ink-muted">
                  {fmt(h.branches.pickup, { airport: branch.airport.name, code: branch.airport.code })}
                </p>
                <span className="relative mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {fmt(h.branches.link, { city: branch.shortCity })}
                  <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <Stagger className="mt-5 grid gap-5 sm:grid-cols-2" gap={0.1}>
          {upcomingBranches.map((branch, i) => (
            <StaggerItem key={branch.slug}>
              <div className="flex h-full flex-col gap-4 rounded-[1.75rem] border border-dashed bg-card p-6 sm:flex-row sm:items-center">
                <span className="font-heading text-4xl font-extrabold text-foreground/10">0{branches.length + i + 1}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl font-bold tracking-tight">{branch.shortCity}</h3>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-brand-strong uppercase">{t.common.badges.soon}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {branch.city}, {branch.province}. {h.branches.soonText}
                  </p>
                </div>
                <Link
                  href={`/contact?subject=${encodeURIComponent(`Alldrive ${branch.shortCity} branch`)}`}
                  className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline"
                >
                  {fmt(h.branches.soonCta, { city: branch.shortCity })} <ArrowUpRightIcon className="size-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 05 How it works */}
      <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground sm:py-28">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-page relative">
          <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              <span className="grid size-7 place-items-center rounded-full bg-white text-[0.65rem] tracking-normal text-ink">05</span> {h.how.eyebrow}
            </p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-white sm:text-5xl">{h.how.title}</h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 md:grid-cols-3" gap={0.12}>
            {steps.map(({ icon: Icon, title, text }, i) => (
              <StaggerItem key={title}>
                <div className="relative h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-7 transition-colors duration-500 hover:bg-white/[0.06]">
                  <span className="absolute top-6 right-7 font-heading text-6xl font-extrabold text-white/[0.06]">0{i + 1}</span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/70">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-bold text-white">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 06 Services */}
      <section className="container-page py-20 sm:py-28">
        <SectionHeading
          index="06"
          eyebrow={h.services.eyebrow}
          title={h.services.title}
          description={h.services.description}
          action={
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link href="/services">
                {h.services.action} <ArrowRightIcon />
              </Link>
            </Button>
          }
        />
        <div className="mt-12">
          <Suspense fallback={<CardGridSkeleton count={6} />}>
            <ServicesPreview />
          </Suspense>
        </div>
      </section>

      {/* Partners */}
      <section className="pb-20 sm:pb-28">
        <Reveal className="container-page mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-brand-strong uppercase">{h.partners.eyebrow}</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight">{h.partners.title}</h2>
          </div>
          <Link href="/partners" className="flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline">
            {h.partners.action} <ArrowRightIcon className="size-4" />
          </Link>
        </Reveal>
        <Suspense fallback={<Skeleton className="container-page h-20 rounded-2xl" />}>
          <PartnersStrip />
        </Suspense>
      </section>

      {/* 07 FAQ */}
      <section className="container-page grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="space-y-5">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-brand-strong uppercase">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.65rem] tracking-normal text-ink-foreground">07</span> {h.faq.eyebrow}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tighter sm:text-5xl">{h.faq.title}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {h.faq.introBefore}{" "}
            <a href={site.phoneHref} className="font-semibold text-foreground underline underline-offset-4">
              {site.phone}
            </a>
            {h.faq.introAfter}
          </p>
          <Button asChild variant="outline" size="xl" className="rounded-full">
            <Link href="/faq">
              {h.faq.action} <ArrowRightIcon />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={0.1}>
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-[1.75rem]" />}>
            <FaqPreview />
          </Suspense>
        </Reveal>
      </section>

      {/* 08 Blog */}
      <section className="bg-muted/40 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            index="08"
            eyebrow={h.blog.eyebrow}
            title={h.blog.title}
            action={
              <Button asChild variant="outline" size="xl" className="rounded-full">
                <Link href="/blog">
                  {h.blog.action} <ArrowRightIcon />
                </Link>
              </Button>
            }
          />
          <div className="mt-12">
            <Suspense fallback={<CardGridSkeleton />}>
              <LatestPosts />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
