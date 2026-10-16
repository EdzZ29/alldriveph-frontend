"use client"

import { CalendarCheckIcon, ChevronDownIcon, GaugeIcon, MapPinIcon, SnowflakeIcon, UsersIcon } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import Image from "next/image"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { useMemo, useState } from "react"

import { EASE_OUT } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import { effectiveRate, groupOf, hasZoneRates, rateGroups, type RateGroup } from "@/lib/rates"
import { branchShort } from "@/lib/branch-labels"
import type { Branch, BranchCode, Meta, RateZone, VehicleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

// swatch colors for the paint names used in the fleet
const PAINT: Record<string, string> = {
  black: "#16181d",
  white: "#f4f5f7",
  "pearl white": "#eef0f2",
  silver: "#c3c7cd",
  gray: "#6b7280",
  grey: "#6b7280",
  blue: "#1f3a68",
  green: "#4a5a35",
  red: "#8f1d24",
  maroon: "#5a1a22",
  orange: "#d4691a",
  brown: "#6b4a32",
  gold: "#b8913a",
}

export function paintHex(color: string | null) {
  return PAINT[(color ?? "").toLowerCase()] ?? "#9ca3af"
}

interface ModelGroup {
  key: string
  name: string
  group: RateGroup
  variants: VehicleSummary[]
}

function groupByModel(vehicles: VehicleSummary[]): ModelGroup[] {
  const map = new Map<string, ModelGroup>()
  for (const v of vehicles) {
    const key = `${v.brand} ${v.model}`
    const entry = map.get(key) ?? { key, name: key, group: groupOf(v.category), variants: [] }
    entry.variants.push(v)
    map.set(key, entry)
  }
  return [...map.values()].map((g) => ({ ...g, variants: g.variants.sort((a, b) => a.daily_rate - b.daily_rate) }))
}

export function FleetShowcase({
  vehicles,
  zones,
  branches,
  limit,
}: {
  vehicles: VehicleSummary[]
  zones: Meta["zones"]
  branches: Branch[]
  limit?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useI18n()
  const s = t.fleet.showcase
  const [branch, setBranch] = useState<BranchCode | "all">("all")
  const branchCounts = useMemo(() => {
    const c: Record<string, number> = { all: vehicles.length }
    for (const v of vehicles) c[v.branch] = (c[v.branch] ?? 0) + 1
    return c
  }, [vehicles])
  const inBranch = useMemo(() => (branch === "all" ? vehicles : vehicles.filter((v) => v.branch === branch)), [vehicles, branch])
  const models = useMemo(() => groupByModel(inBranch), [inBranch])
  const [filter, setFilter] = useState<RateGroup | "all">("all")
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: models.length }
    for (const m of models) c[m.group] = (c[m.group] ?? 0) + 1
    return c
  }, [models])
  const filtered = filter === "all" ? models : models.filter((m) => m.group === filter)
  const collapsed = !!limit && !expanded && filter === "all" && branch === "all" && filtered.length > limit
  const visible = collapsed ? filtered.slice(0, limit) : filtered

  const tabs = [{ key: "all" as const, label: s.all }, ...rateGroups.map((g) => ({ key: g.key, label: t.common.groups[g.key] }))].filter((tab) => counts[tab.key])

  const selectBranch = (code: BranchCode | "all") => {
    setBranch(code)
    // a type that has no cars in the new branch would show an empty grid
    const next = code === "all" ? vehicles : vehicles.filter((v) => v.branch === code)
    if (filter !== "all" && !next.some((v) => groupOf(v.category) === filter)) setFilter("all")
  }

  return (
    <div>
      <LayoutGroup id="fleet-branch">
        <div role="tablist" aria-label={s.byBranch} className="mb-4 grid grid-cols-2 gap-2 rounded-[1.4rem] border bg-card p-1.5 sm:inline-grid sm:grid-cols-4">
          {[{ code: "all" as const, label: t.fleet.filters.allBranches }, ...branches.map((b) => ({ code: b.code, label: fmt(t.fleet.filters.carsIn, { branch: branchShort[b.code] ?? b.name }) }))].map(
            (option) => {
              const active = branch === option.code
              return (
                <button
                  key={option.code}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectBranch(option.code)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="branch-pill"
                      className="absolute inset-0 rounded-2xl bg-primary shadow-[0_8px_20px_-8px] shadow-primary/70"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <MapPinIcon className="relative size-4" />
                  <span className="relative">{option.label}</span>
                  <span className={cn("relative rounded-full px-1.5 text-[0.7rem]", active ? "bg-ink/15" : "bg-muted text-muted-foreground")}>
                    {branchCounts[option.code] ?? 0}
                  </span>
                </button>
              )
            }
          )}
        </div>
      </LayoutGroup>

      <LayoutGroup id="fleet-filter">
        <div role="tablist" aria-label={s.byType} className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "border-transparent text-ink-foreground" : "bg-card text-foreground/80 hover:border-foreground/30"
                )}
              >
                {active && (
                  <motion.span layoutId="fleet-pill" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{tab.label}</span>
                <span className={cn("relative rounded-full px-1.5 text-[0.7rem]", active ? "bg-white/15" : "bg-muted text-muted-foreground")}>{counts[tab.key]}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((model) => (
            <motion.div
              key={model.key}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <ModelCard model={model} zonesByBranch={zones} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {s.none}
        </p>
      )}

      {collapsed && (
        <motion.div layout className="mt-10 flex justify-center">
          <Button variant="outline" size="xl" className="rounded-full bg-card" onClick={() => setExpanded(true)}>
            {fmt(s.showAll, { count: filtered.length })} <ChevronDownIcon />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

function ModelCard({ model, zonesByBranch }: { model: ModelGroup; zonesByBranch: Meta["zones"] }) {
  const [selected, setSelected] = useState(0)
  const [ratesOpen, setRatesOpen] = useState(false)
  const { t } = useI18n()
  const vehicle = model.variants[selected]
  const zones: RateZone[] = zonesByBranch[vehicle.branch] ?? []
  const label = t.common.groups[model.group]

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border bg-card p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-ink-foreground uppercase">{label}</span>
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-success uppercase">
          <span className="size-1.5 rounded-full bg-success" /> {t.common.badges.available}
        </span>
      </div>

      <Link href={`/fleet/${vehicle.slug}`} className="relative mt-2 block aspect-[16/10] dark:rounded-2xl dark:bg-slate-100" aria-label={fmt(t.fleet.showcase.details, { name: vehicle.name })}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={vehicle.id}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <Image
              src={vehicle.image_url}
              alt={`${vehicle.name} ${vehicle.color ?? ""}`.trim()}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
              unoptimized={vehicle.image_url.startsWith("/media/")}
              className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05] dark:p-2"
            />
          </motion.div>
        </AnimatePresence>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {vehicle.brand} · {vehicle.color} · {branchShort[vehicle.branch]}
          </p>
          <h3 className="font-heading text-lg leading-tight font-bold tracking-tight text-balance">{vehicle.model}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.65rem] text-muted-foreground">{t.common.units.fromLower}</p>
          <p className="font-heading text-xl leading-none font-extrabold text-brand-strong">{peso(effectiveRate(vehicle, "local"))}</p>
          <p className="text-[0.65rem] text-muted-foreground">{t.common.units.perDay}</p>
        </div>
      </div>

      {model.variants.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t.fleet.showcase.color}>
          {model.variants.map((v, i) => (
            <button
              key={v.id}
              role="radio"
              aria-checked={i === selected}
              aria-label={`${v.color} ${t.common.transmission[v.transmission]}`}
              title={`${v.color}, ${t.common.transmission[v.transmission]}`}
              onClick={() => setSelected(i)}
              className={cn(
                "size-7 rounded-full border border-black/10 transition-all duration-300 hover:scale-110",
                i === selected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
              )}
              style={{ backgroundColor: paintHex(v.color) }}
            />
          ))}
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-1 text-[0.7rem] text-muted-foreground">
        <li className="flex items-center gap-1 rounded-full border px-2 py-0.5">
          <UsersIcon className="size-3" /> {fmt(t.common.units.seats, { count: vehicle.seats })}
        </li>
        <li className="flex items-center gap-1 rounded-full border px-2 py-0.5">
          <GaugeIcon className="size-3" /> {vehicle.transmission === "automatic" ? t.common.transmission.auto : t.common.transmission.manual}
        </li>
        <li className="flex items-center gap-1 rounded-full border px-2 py-0.5">
          <SnowflakeIcon className="size-3" /> {t.common.units.ac}
        </li>
      </ul>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t pt-4">
          <button
            type="button"
            onClick={() => setRatesOpen((v) => !v)}
            aria-expanded={ratesOpen}
            className="flex items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-foreground"
          >
            {t.fleet.showcase.ratesByZone}
            <ChevronDownIcon className={cn("size-4 transition-transform duration-300", ratesOpen && "rotate-180")} />
          </button>
          <Button asChild className="rounded-full px-4 font-semibold">
            <Link href={`/book/${vehicle.slug}`}>
              <CalendarCheckIcon /> {t.common.actions.book}
            </Link>
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {ratesOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="overflow-hidden text-sm"
            >
              {zones.map((zone) => (
                <li key={zone.code} className="flex justify-between border-b border-dashed py-2 first:mt-3 last:border-0">
                  <span className="text-muted-foreground">{zoneLabel(t, zone.name)}</span>
                  <span className="font-semibold tabular-nums">
                    {hasZoneRates(vehicle) || zone.code === "local" ? peso(effectiveRate(vehicle, zone.code)) : t.common.rates.onRequest}
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}
