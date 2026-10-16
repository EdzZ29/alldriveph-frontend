"use client"

import { ArrowRightIcon, BriefcaseIcon, FuelIcon, GaugeIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "@/components/i18n/link"
import { useOptionalI18n } from "@/components/i18n/provider"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { branchShort } from "@/lib/branch-labels"
import { capitalize, categoryLabels, peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import type { VehicleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CarImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("/media/") || src.startsWith("http")}
      className={cn("object-contain p-5 transition-transform duration-500", className)}
    />
  )
}

export function VehicleSpecs({ vehicle, className }: { vehicle: VehicleSummary; className?: string }) {
  // also rendered in the English only admin panel, where there is no translation context
  const t = useOptionalI18n()?.t
  const specs = [
    { icon: UsersIcon, label: t ? fmt(t.common.units.seats, { count: vehicle.seats }) : `${vehicle.seats} seats` },
    { icon: GaugeIcon, label: t ? t.common.transmission[vehicle.transmission] : capitalize(vehicle.transmission) },
    { icon: FuelIcon, label: t ? t.common.fuel[vehicle.fuel_type] : capitalize(vehicle.fuel_type) },
    { icon: BriefcaseIcon, label: t ? fmt(t.common.units.bags, { count: vehicle.luggage }) : `${vehicle.luggage} bags` },
  ]
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground", className)}>
      {specs.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-foreground/50" />
          {label}
        </li>
      ))}
    </ul>
  )
}

export function VehicleCard({ vehicle, query, priority }: { vehicle: VehicleSummary; query?: string; priority?: boolean }) {
  const t = useOptionalI18n()?.t
  const href = `/fleet/${vehicle.slug}${query ? `?${query}` : ""}`
  // the booking form reads the same from, to, location and service parameters
  const bookHref = `/book/${vehicle.slug}${query ? `?${query}` : ""}`
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)]">
      <div className="relative aspect-[16/10] dark:m-2 dark:rounded-[1.4rem] dark:bg-slate-100">
        <CarImage
          src={vehicle.image_url}
          alt={`${vehicle.name} ${vehicle.color ?? ""}`.trim()}
          className="mix-blend-multiply group-hover:scale-[1.05]"
          priority={priority}
        />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-ink-foreground uppercase">
            {t ? t.common.categories[vehicle.category] : categoryLabels[vehicle.category]}
          </span>
          {vehicle.is_featured && <Badge className="font-semibold">{t?.common.badges.popular ?? "Popular"}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-tight">
            <Link href={href} className="after:absolute after:inset-0">
              {vehicle.name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            {vehicle.year} {vehicle.color ? `· ${vehicle.color}` : ""} · {branchShort[vehicle.branch]}
          </p>
        </div>
        <VehicleSpecs vehicle={vehicle} />
        <div className="mt-auto space-y-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{t?.common.units.from ?? "From"}</p>
            <p className="font-heading text-xl font-extrabold text-brand-strong">
              {peso(vehicle.zone_rates?.local ?? vehicle.daily_rate)}
              <span className="text-sm font-normal text-muted-foreground"> {t?.common.units.slashDay ?? "/ day"}</span>
            </p>
          </div>
          {/* above the whole-card link, so each button goes to its own page */}
          <div className="relative z-10 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="xl" className="min-w-0 px-4 font-semibold">
              <Link href={href}>
                <span className="truncate">{t?.common.actions.seeDetails ?? "See details"}</span>
              </Link>
            </Button>
            <Button asChild size="xl" className="min-w-0 px-4 font-semibold">
              <Link href={bookHref}>
                <span className="truncate">{t?.common.actions.bookNow ?? "Book now"}</span>
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
