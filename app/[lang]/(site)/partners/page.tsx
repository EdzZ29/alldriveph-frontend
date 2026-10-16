import { ArrowRightIcon, BuildingIcon, HandshakeIcon, TrendingUpIcon, UsersIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { ExternalLink } from "@/components/home/sections"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { PageHeader, SectionHeading } from "@/components/site/page-header"
import { CardGridSkeleton } from "@/components/site/skeletons"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { isOptimizable } from "@/lib/images"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.partners.meta.title, description: t.partners.meta.description, alternates: alternatesFor(lang, "/partners") }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")
}

async function PartnerGrid() {
  const { t } = await getI18n()
  const result = await safeLoad(api.partners)
  if (result.error) return <ApiErrorState />
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((partner) => (
        <article key={partner.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-card">
          {partner.image_url && (
            <div className="relative aspect-video overflow-hidden bg-muted">
              <Image
                src={partner.image_url}
                alt={partner.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized={!isOptimizable(partner.image_url)}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4">
            {partner.logo_url ? (
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-white">
                <Image
                  src={partner.logo_url}
                  alt={fmt(t.partners.logoAlt, { name: partner.name })}
                  fill
                  sizes="56px"
                  unoptimized={!isOptimizable(partner.logo_url)}
                  className="object-contain p-1"
                />
              </span>
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/15 font-heading text-lg font-semibold text-brand-strong">
                {initials(partner.name)}
              </span>
            )}
            <div>
              <h2 className="font-sans text-base font-semibold">{partner.name}</h2>
              <p className="text-sm text-muted-foreground">{partner.category}</p>
            </div>
          </div>
          {partner.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>}
          {partner.website_url && (
            <div className="mt-auto pt-4 text-sm">
              <ExternalLink href={partner.website_url}>{t.partners.visitWebsite}</ExternalLink>
            </div>
          )}
          </div>
        </article>
      ))}
    </div>
  )
}

const benefitIcons = { rates: TrendingUpIcon, coordinator: UsersIcon, billing: BuildingIcon } as const

export default async function PartnersPage() {
  const { t } = await getI18n()
  const p = t.partners
  const benefits = (Object.keys(benefitIcons) as (keyof typeof benefitIcons)[]).map((key) => ({ icon: benefitIcons[key], ...p.benefits[key] }))
  return (
    <>
      <PageHeader
        eyebrow={p.header.eyebrow}
        title={p.header.title}
        description={p.header.description}
      />
      <section className="container-page py-14 sm:py-20">
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <PartnerGrid />
        </Suspense>
      </section>
      <section className="border-t bg-muted/30">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <SectionHeading
              eyebrow={p.become.eyebrow}
              title={p.become.title}
              description={p.become.description}
            />
            <Button asChild size="xl">
              <Link href={`/contact?subject=${encodeURIComponent(p.become.subject)}`}>
                <HandshakeIcon /> {p.become.cta} <ArrowRightIcon />
              </Link>
            </Button>
          </div>
          <ul className="grid gap-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border bg-card p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand-strong">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-sans font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
