import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FileTextIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { CarImage, VehicleCard, VehicleSpecs } from "@/components/site/vehicle-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { branchShort } from "@/lib/branch-labels"
import { peso } from "@/lib/format"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import { getI18n } from "@/lib/i18n/server"
import { breadcrumbSchema, JsonLd, vehicleSchema } from "@/lib/seo"

export async function generateMetadata({ params }: PageProps<"/[lang]/fleet/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const { data: vehicle } = await safeLoad(() => api.vehicle(slug))
  const { t, lang } = await getI18n()
  const d = t.fleet.detail
  if (!vehicle) return { title: d.notFound }
  const summary = fmt(d.metaDescription, {
    name: vehicle.name,
    rate: peso(vehicle.zone_rates?.local ?? vehicle.daily_rate),
    seats: vehicle.seats,
    transmission: t.common.transmission[vehicle.transmission].toLowerCase(),
  })
  return {
    title: fmt(d.metaTitle, { name: vehicle.name }),
    alternates: alternatesFor(lang, `/fleet/${vehicle.slug}`),
    description: `${summary} ${vehicle.description}`.slice(0, 160),
    openGraph: { images: [{ url: vehicle.image_url }] },
  }
}

async function VehicleDetail({
  params,
  searchParams,
}: {
  params: PageProps<"/[lang]/fleet/[slug]">["params"]
  searchParams: PageProps<"/[lang]/fleet/[slug]">["searchParams"]
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams])
  const result = await safeLoad(() => api.vehicle(slug))
  if (result.error) return <ApiErrorState />

  const vehicle = result.data
  if (!vehicle) notFound()
  const { data: meta } = await safeLoad(api.meta)
  const zones = meta?.zones[vehicle.branch] ?? []
  const { t } = await getI18n()
  const d = t.fleet.detail
  const discount = Math.round((meta?.policies.long_rental_discount ?? 0.1) * 100)
  const discountDays = meta?.policies.long_rental_days ?? 7

  const carry = new URLSearchParams()
  for (const key of ["from", "to", "location", "service"]) {
    const value = search[key]
    if (typeof value === "string") carry.set(key, value)
  }
  const bookHref = `/book/${vehicle.slug}${carry.size ? `?${carry}` : ""}`

  return (
    <>
      <JsonLd
        data={[
          vehicleSchema(vehicle),
          breadcrumbSchema([
            { name: t.blog.breadcrumbHome, path: "/" },
            { name: d.fleet, path: "/fleet" },
            { name: vehicle.name, path: `/fleet/${vehicle.slug}` },
          ]),
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <div className="car-panel relative aspect-[16/10] rounded-3xl border">
            <CarImage src={vehicle.image_url} alt={vehicle.name} priority sizes="(min-width: 1024px) 60vw, 100vw" className="p-8 sm:p-12" />
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">{d.about}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{vehicle.description}</p>
            {vehicle.features.length > 0 && (
              <>
                <Separator className="my-5" />
                <h3 className="font-sans text-sm font-semibold">{d.features}</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-brand-strong">
                        <CheckIcon className="size-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t.common.categories[vehicle.category]}</Badge>
              {vehicle.is_featured && <Badge>{t.common.badges.popular}</Badge>}
              <Badge variant="outline" className="gap-1">
                <MapPinIcon className="size-3" /> {fmt(t.common.badges.branch, { branch: branchShort[vehicle.branch] })}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{vehicle.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {vehicle.year} {vehicle.brand} {vehicle.model}
              {vehicle.color ? ` ${fmt(d.inColor, { color: vehicle.color })}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <VehicleSpecs vehicle={vehicle} className="gap-y-3" />
            <Separator className="my-5" />
            <div className="space-y-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">{d.rateByDestination}</p>
              <ul className="divide-y rounded-xl border">
                {zones.map((zone) => {
                  const rate = vehicle.zone_rates?.[zone.code] ?? (zone.code === "local" ? vehicle.daily_rate : null)
                  return (
                    <li key={zone.code} className="flex items-baseline justify-between px-4 py-2.5">
                      <span className="text-sm text-muted-foreground">{zoneLabel(t, zone.name)}</span>
                      <span className={rate ? "font-heading text-lg font-bold" : "text-sm text-muted-foreground"}>
                        {rate ? peso(rate) : t.common.rates.onRequest}
                        {rate && <span className="text-xs font-normal text-muted-foreground"> {t.common.units.slashDay}</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserRoundIcon className="size-3.5" /> {d.addDriver}
                </span>
                <span className="text-sm font-medium">+ {peso(vehicle.driver_rate)} {t.common.units.slashDay}</span>
              </div>
              <p className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
                {fmt(d.longDiscount, { percent: discount, days: discountDays })}
              </p>
            </div>
            <Button asChild size="xl" className="mt-6 w-full">
              <Link href={bookHref}>
                {t.common.actions.bookThisCar} <ArrowRightIcon />
              </Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{d.noPayment}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
                <ShieldCheckIcon className="size-4 text-brand-strong" /> {d.included}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {d.includedItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-5">
              <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
                <FileTextIcon className="size-4 text-brand-strong" /> {d.need}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {d.requirements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <Suspense>
        <SimilarCars category={vehicle.category} excludeId={vehicle.id} />
      </Suspense>
    </>
  )
}

async function SimilarCars({ category, excludeId }: { category: string; excludeId: string }) {
  const { data } = await safeLoad(() => api.vehicles({ category }))
  const similar = (data ?? []).filter((v) => v.id !== excludeId).slice(0, 3)
  if (similar.length === 0) return null
  const { t } = await getI18n()
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-semibold">{t.fleet.detail.similar}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
      <Skeleton className="aspect-[16/10] rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default async function VehiclePage(props: PageProps<"/[lang]/fleet/[slug]">) {
  const { t } = await getI18n()
  return (
    <div className="container-page py-8 sm:py-12">
      <Button asChild variant="ghost" className="-ml-2 mb-6 text-muted-foreground">
        <Link href="/fleet">
          <ArrowLeftIcon /> {t.fleet.detail.back}
        </Link>
      </Button>
      <Suspense fallback={<DetailSkeleton />}>
        <VehicleDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}
