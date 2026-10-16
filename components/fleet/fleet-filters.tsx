"use client"

import { CalendarRangeIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { AnimatedTabs } from "@/components/rareui/AnimatedTab"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n/provider"
import { branchShort } from "@/lib/branch-labels"
import { formatDateTime } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const BRANCHES = ["butuan", "cagayan-de-oro", "davao"] as const
const CATEGORIES = ["sedan", "mpv", "suv", "pickup", "van"] as const

export function FleetFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(params.get("q") ?? "")
  const { t, lang } = useI18n()
  const f = t.fleet.filters
  const branchTabs = [{ id: "all", label: f.allBranches }, ...BRANCHES.map((id) => ({ id, label: fmt(f.carsIn, { branch: branchShort[id] }) }))]
  const categoryTabs = [{ id: "all", label: f.allCars }, ...CATEGORIES.map((id) => ({ id, label: t.common.categories[id] }))]

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value && value !== "all") next.set(key, value)
      else next.delete(key)
    }
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }

  // debounce free text search
  useEffect(() => {
    const current = params.get("q") ?? ""
    if (query === current) return
    const timer = setTimeout(() => update({ q: query.trim() || null }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const from = params.get("from")
  const to = params.get("to")
  const hasFilters = ["branch", "category", "transmission", "min_seats", "q", "sort"].some((key) => params.get(key))

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-70")}>
      {from && to && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <CalendarRangeIcon className="size-4 text-brand-strong" />
          <span>
            {f.availableFrom} <strong className="font-semibold">{formatDateTime(from, lang)}</strong> {f.to}{" "}
            <strong className="font-semibold">{formatDateTime(to, lang)}</strong>
          </span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => update({ from: null, to: null, location: null })}>
            <XIcon /> {f.clearDates}
          </Button>
        </div>
      )}

      <AnimatedTabs
        tabs={branchTabs}
        activeTab={params.get("branch") ?? "all"}
        onChange={(id) => update({ branch: id })}
        className="w-fit"
      />

      <AnimatedTabs
        tabs={categoryTabs}
        activeTab={params.get("category") ?? "all"}
        onChange={(id) => update({ category: id })}
        className="w-fit"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <InputGroup className="h-10 rounded-xl md:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={f.searchLabel}
            placeholder={f.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <div className="grid grid-cols-3 gap-2 md:flex">
          <Select value={params.get("transmission") ?? "all"} onValueChange={(v) => update({ transmission: v })}>
            <SelectTrigger aria-label={f.transmission} className="h-10! w-full rounded-xl md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.anyGearbox}</SelectItem>
              <SelectItem value="automatic">{t.common.transmission.automatic}</SelectItem>
              <SelectItem value="manual">{t.common.transmission.manual}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={params.get("min_seats") ?? "all"} onValueChange={(v) => update({ min_seats: v })}>
            <SelectTrigger aria-label={f.seats} className="h-10! w-full rounded-xl md:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.anySeats}</SelectItem>
              {[5, 7, 12].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {fmt(f.minSeats, { count: n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={params.get("sort") ?? "recommended"} onValueChange={(v) => update({ sort: v === "recommended" ? null : v })}>
            <SelectTrigger aria-label={f.sort} className="h-10! w-full rounded-xl md:w-44">
              <SlidersHorizontalIcon className="text-muted-foreground max-sm:hidden" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(f.sortOptions) as (keyof typeof f.sortOptions)[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {f.sortOptions[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            className="md:ml-auto"
            onClick={() => {
              setQuery("")
              update({ branch: null, category: null, transmission: null, min_seats: null, q: null, sort: null })
            }}
          >
            <XIcon /> {f.reset}
          </Button>
        )}
      </div>
    </div>
  )
}
