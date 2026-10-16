"use client"

import { MapPinIcon } from "lucide-react"

import { fieldFocus, fieldShell } from "@/components/booking/field-styles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Location } from "@/lib/types"
import { useI18n } from "@/components/i18n/provider"
import { cn } from "@/lib/utils"

export function LocationSelect({
  id,
  value,
  onChange,
  locations,
  unavailable,
  className,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  locations: Location[]
  /** returns a short reason when an option cannot be picked */
  unavailable?: (location: Location) => string | null
  className?: string
}) {
  const selected = locations.find((l) => l.code === value)
  const { t } = useI18n()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn(fieldShell, fieldFocus, "h-12! w-full px-3", className)}>
        <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <MapPinIcon className="text-brand-strong" />
          {/* show only the name in the trigger; the list shows name and address */}
          <SelectValue placeholder={t.booking.location.placeholder}>{selected?.name}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-80 w-(--radix-select-trigger-width) min-w-72">
        {locations.map((loc) => {
          const reason = unavailable?.(loc) ?? null
          return (
            <SelectItem key={loc.code} value={loc.code} disabled={!!reason} className="py-2 pl-2.5">
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-medium text-foreground">{loc.name}</span>
                <span className="text-xs text-muted-foreground">{reason ?? loc.address}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
