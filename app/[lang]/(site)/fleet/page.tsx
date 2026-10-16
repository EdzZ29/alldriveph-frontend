import { CarFrontIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { FleetFilters } from "@/components/fleet/fleet-filters"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { PageHeader } from "@/components/site/page-header"
import { VehicleGridSkeleton } from "@/components/site/skeletons"
import { VehicleCard } from "@/components/site/vehicle-card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.fleet.meta.title, description: t.fleet.meta.description, alternates: alternatesFor(lang, "/fleet") }
}

type Search = Record<string, string | string[] | undefined>

const LOCATION_BRANCH: Record<string, string> = {
  "butuan-city": "butuan",
  "butuan-airport": "butuan",
  "cagayan-de-oro-city": "cagayan-de-oro",
  "laguindingan-airport": "cagayan-de-oro",
  "davao-city": "davao",
  "davao-airport": "davao",
}

function pick(search: Search, key: string) {
  const value = search[key]
  return typeof value === "string" ? value : undefined
}

async function FleetResults({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams
  const { t } = await getI18n()
  const f = t.fleet
  const from = pick(search, "from")
  const to = pick(search, "to")
  const location = pick(search, "location")
  // searching from a pickup point shows the cars kept at that branch
  const branch = pick(search, "branch") ?? (location ? LOCATION_BRANCH[location] : undefined)
  const result = await safeLoad(() =>
    api.vehicles({
      branch,
      category: pick(search, "category"),
      transmission: pick(search, "transmission"),
      min_seats: pick(search, "min_seats"),
      q: pick(search, "q"),
      sort: pick(search, "sort"),
      available_from: from,
      available_to: to,
    })
  )
  if (result.error) return <ApiErrorState title={f.loadError} />

  const vehicles = result.data
  if (vehicles.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CarFrontIcon />
          </EmptyMedia>
          <EmptyTitle>{f.empty.title}</EmptyTitle>
          <EmptyDescription>
            {from ? f.empty.booked : f.empty.filters}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link href="/fleet">{f.empty.showAll}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const carry = new URLSearchParams()
  for (const key of ["from", "to", "location", "service"]) {
    const value = pick(search, key)
    if (value) carry.set(key, value)
  }

  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">
        {vehicles.length === 1
          ? from ? f.count.availableOne : f.count.fleetOne
          : fmt(from ? f.count.availableMany : f.count.fleetMany, { count: vehicles.length })}
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle, i) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} query={carry.toString()} priority={i < 3} />
        ))}
      </div>
    </>
  )
}

export default async function FleetPage({ searchParams }: PageProps<"/[lang]/fleet">) {
  const { t } = await getI18n()
  return (
    <>
      <PageHeader
        eyebrow={t.fleet.header.eyebrow}
        title={t.fleet.header.title}
        description={t.fleet.header.description}
      />
      <section className="container-page py-10 sm:py-14">
        <Suspense fallback={<Skeleton className="h-28 w-full rounded-2xl" />}>
          <FleetFilters />
        </Suspense>
        <div className="mt-8">
          <Suspense fallback={<VehicleGridSkeleton />}>
            <FleetResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
