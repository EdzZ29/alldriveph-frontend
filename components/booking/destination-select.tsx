"use client"

import { CheckIcon, ChevronsUpDownIcon, MapPinIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useI18n } from "@/components/i18n/provider"
import { peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import type { RateZone, ZoneCode } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Searchable list of every Mindanao destination, grouped by area with that area's daily rate. */
export function DestinationSelect({
  id,
  zones,
  value,
  onChange,
  rateFor,
}: {
  id: string
  zones: RateZone[]
  value: string
  onChange: (place: string, zone: ZoneCode) => void
  /** daily rate for a zone, or null when the price is quoted on request */
  rateFor: (zone: ZoneCode) => number | null
}) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const d = t.booking.destination
  const price = (r: number | null) => (r ? fmt(d.perDay, { rate: peso(r) }) : t.common.rates.onRequest)
  const zoneOf = zones.find((z) => z.groups.some((g) => g.places.includes(value)))
  const rate = zoneOf ? rateFor(zoneOf.code) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between rounded-xl px-3 font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPinIcon className="text-muted-foreground" />
            <span className="truncate">{value || d.placeholder}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {zoneOf && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {zoneLabel(t, zoneOf.name)} · <strong className="font-semibold text-foreground">{price(rate)}</strong>
              </span>
            )}
            <ChevronsUpDownIcon className="text-muted-foreground" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={d.search} />
          <CommandList className="max-h-80">
            <CommandEmpty>{d.empty}</CommandEmpty>
            {zones.flatMap((zone) =>
              zone.groups.map((group) => {
                const groupRate = rateFor(zone.code)
                return (
                  <CommandGroup
                    key={`${zone.code}-${group.name ?? "all"}`}
                    heading={`${group.name ?? zoneLabel(t, zone.name)} · ${price(groupRate)}`}
                  >
                    {group.places.map((place) => (
                      <CommandItem
                        key={place}
                        value={`${place} ${group.name ?? ""} ${zone.name}`}
                        onSelect={() => {
                          onChange(place, zone.code)
                          setOpen(false)
                        }}
                      >
                        <CheckIcon className={cn("size-4", place === value ? "opacity-100" : "opacity-0")} />
                        {place}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              })
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
