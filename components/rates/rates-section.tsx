"use client"

import { BadgePercentIcon, MapPinIcon, UserRoundIcon } from "lucide-react"

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { useI18n } from "@/components/i18n/provider"
import { peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import type { Messages } from "@/lib/i18n/messages"
import { rateGroups, zoneRate } from "@/lib/rates"
import type { Meta, RateZone, VehicleSummary, ZoneCode } from "@/lib/types"
import { cn } from "@/lib/utils"

/** a daily rate, null when quoted on request, "none" when the branch has no cars of that type */
type Cell = number | null | "none"

function buildTable(vehicles: VehicleSummary[], zones: RateZone[]) {
  const table: Record<string, Record<ZoneCode, Cell>> = {}
  for (const group of rateGroups) {
    const members = vehicles.filter((v) => group.categories.includes(v.category))
    table[group.key] = {} as Record<ZoneCode, Cell>
    for (const zone of zones) {
      const rates = members.map((v) => zoneRate(v, zone.code)).filter((r): r is number => r !== null)
      // cars without zone pricing (vans) show their base rate in Butuan and are quoted elsewhere
      if (!rates.length && zone.code === "local" && members.length) rates.push(...members.map((v) => v.daily_rate))
      table[group.key][zone.code] = !members.length ? "none" : rates.length ? Math.min(...rates) : null
    }
  }
  return table
}

/** Models whose zone rates differ from the cheapest rate in their column. */
function specialRates(t: Messages, vehicles: VehicleSummary[], zones: RateZone[], table: ReturnType<typeof buildTable>) {
  const seen = new Map<string, { name: string; group: string; rates: { zone: string; rate: number }[] }>()
  for (const v of vehicles) {
    const group = rateGroups.find((g) => g.categories.includes(v.category))
    if (!group) continue
    const rates = zones.map((z) => ({ zone: zoneLabel(t, z.name), rate: zoneRate(v, z.code) })).filter((r): r is { zone: string; rate: number } => r.rate !== null)
    if (!rates.length) continue
    const differs = zones.some((z) => {
      const r = zoneRate(v, z.code)
      return r !== null && r !== table[group.key][z.code]
    })
    const key = `${v.brand} ${v.model}`
    if (differs && !seen.has(key)) seen.set(key, { name: key, group: t.common.groups[group.key], rates })
  }
  return [...seen.values()]
}

export function RatesTable({ vehicles, zones, meta }: { vehicles: VehicleSummary[]; zones: RateZone[]; meta: Meta }) {
  const { t } = useI18n()
  const r = t.rates.table
  const table = buildTable(vehicles, zones)
  const specials = specialRates(t, vehicles, zones, table)
  const [driverBefore, driverAfter] = r.driver.split("{rate}")
  const driverRate = vehicles.length ? Math.min(...vehicles.map((v) => v.driver_rate)) : meta.policies.default_driver_rate
  const discount = Math.round(meta.policies.long_rental_discount * 100)

  return (
    <div className="space-y-5">
      <Reveal className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink text-ink-foreground">
              <tr>
                <th scope="col" className="px-6 py-6 text-left text-[0.65rem] font-semibold tracking-[0.25em] text-ink-muted uppercase">
                  {r.zone}
                </th>
                {rateGroups.map((g) => (
                  <th key={g.key} scope="col" className="px-4 py-6 text-center">
                    <span className="block font-heading text-base font-bold text-white">{t.common.groups[g.key]}</span>
                    <span className="block text-[0.7rem] font-normal text-ink-muted">{t.common.groupSeats[g.key]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.map((zone) => (
                <tr key={zone.code} className="transition-colors hover:bg-primary/[0.06]">
                  <th scope="row" className="px-6 py-4 text-left font-semibold">
                    <span className="flex items-center gap-2.5">
                      <MapPinIcon className="size-4 text-brand-strong" />
                      {zoneLabel(t, zone.name)}
                    </span>
                  </th>
                  {rateGroups.map((g) => {
                    const value = table[g.key][zone.code]
                    return (
                      <td
                        key={g.key}
                        className={cn(
                          "px-4 py-4 text-center font-heading tabular-nums",
                          typeof value === "number" ? "text-base font-bold" : "text-sm font-medium text-muted-foreground",
                          value === "none" && "text-muted-foreground/60"
                        )}
                      >
                        {typeof value === "number" ? peso(value) : value === "none" ? t.common.rates.notAvailable : t.common.rates.onRequest}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {specials.map((s) => (
        <Reveal key={s.name} className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-center text-sm">
          <strong>{s.name}</strong> ({s.group}) {r.ownRate}{" "}
          {s.rates.map((r, i) => (
            <span key={r.zone}>
              {i > 0 && " · "}
              {r.zone} <strong>{peso(r.rate)}</strong>
            </span>
          ))}
        </Reveal>
      ))}

      <Reveal className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
        <p className="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-ink-foreground">
          <BadgePercentIcon className="size-4 text-primary" />
          <span>
            <strong className="text-primary">{fmt(r.save, { percent: discount })}</strong> {fmt(r.saveOn, { days: meta.policies.long_rental_days })}
          </span>
        </p>
        <p className="flex items-center justify-center gap-2 rounded-full border bg-card px-5 py-3 text-sm">
          <UserRoundIcon className="size-4 text-brand-strong" />
          <span>
            {driverBefore}
            <strong>{peso(driverRate)}</strong>
            {driverAfter}
          </span>
        </p>
      </Reveal>
      <p className="text-center text-xs text-muted-foreground">
        {r.note}
      </p>
    </div>
  )
}

export function ZoneMap({ zones, vehicles }: { zones: RateZone[]; vehicles: VehicleSummary[] }) {
  const fromRate = (code: ZoneCode) => {
    const rates = vehicles.map((v) => zoneRate(v, code)).filter((r): r is number => r !== null)
    return rates.length ? Math.min(...rates) : null
  }
  const simple = zones.filter((z) => z.groups.length === 1 && !z.groups[0].name)
  const regional = zones.filter((z) => !simple.includes(z))

  return (
    <div id="zones" className="grid scroll-mt-28 gap-5 lg:grid-cols-[1fr_1.7fr]">
      <Stagger className="grid gap-5" gap={0.1}>
        {simple.map((zone) => (
          <StaggerItem key={zone.code}>
            <ZoneCard zone={zone} from={fromRate(zone.code)}>
              <PlaceChips places={zone.groups[0].places} />
            </ZoneCard>
          </StaggerItem>
        ))}
      </Stagger>
      {regional.map((zone) => (
        <Reveal key={zone.code} delay={0.1}>
          <ZoneCard zone={zone} from={fromRate(zone.code)}>
            <div className="grid gap-6 sm:grid-cols-2">
              {zone.groups.map((group) => (
                <div key={group.name ?? "places"}>
                  {group.name && <p className="mb-2.5 text-[0.65rem] font-semibold tracking-[0.22em] text-brand-strong uppercase">{group.name}</p>}
                  <PlaceChips places={group.places} />
                </div>
              ))}
            </div>
          </ZoneCard>
        </Reveal>
      ))}
    </div>
  )
}

function ZoneCard({ zone, from, children }: { zone: RateZone; from: number | null; children: React.ReactNode }) {
  const { t } = useI18n()
  const [fromBefore, fromAfter] = t.rates.zoneFrom.split("{rate}")
  return (
    <article className="h-full rounded-[1.75rem] border bg-card p-6 transition-shadow duration-500 hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)]">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
            <MapPinIcon className="size-4" />
          </span>
          {zoneLabel(t, zone.name)}
        </h3>
        {from && (
          <p className="text-xs text-muted-foreground">
            {fromBefore}
            <strong className="font-heading text-base text-brand-strong">{peso(from)}</strong>
            {fromAfter}
          </p>
        )}
      </header>
      {children}
    </article>
  )
}

function PlaceChips({ places }: { places: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {places.map((place) => (
        <li key={place} className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/10">
          {place}
        </li>
      ))}
    </ul>
  )
}
