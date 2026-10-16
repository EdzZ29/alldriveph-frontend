"use client"

import { InfoIcon } from "lucide-react"

import { CarImage, VehicleSpecs } from "@/components/site/vehicle-card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/components/i18n/provider"
import { peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import type { Quote, VehicleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PriceSummary({
  vehicle,
  quote,
  loading,
  error,
  place,
  discountPercent,
}: {
  vehicle: VehicleSummary
  quote: Quote | null
  loading: boolean
  error: string | null
  place: string
  discountPercent: number
}) {
  const { t } = useI18n()
  const s = t.booking.summary
  // built from the quote amounts so the lines read in the visitor's language
  const days = quote ? `${quote.days} ${quote.days === 1 ? t.common.units.day : t.common.units.days}` : ""
  const lines = quote
    ? [
        { label: fmt(s.baseLine, { car: vehicle.name, days, place }), amount: quote.base_amount },
        ...(quote.discount_amount > 0 ? [{ label: fmt(s.discountLine, { percent: discountPercent }), amount: -quote.discount_amount }] : []),
        ...(quote.driver_amount > 0 ? [{ label: fmt(s.driverLine, { days }), amount: quote.driver_amount }] : []),
        ...(quote.extras_amount > 0 ? [{ label: s.extrasLine, amount: quote.extras_amount }] : []),
      ]
    : []
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="car-panel relative aspect-[16/9]">
          <CarImage src={vehicle.image_url} alt={vehicle.name} sizes="380px" />
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-lg font-semibold">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} {vehicle.color ? `· ${vehicle.color}` : ""}
            </p>
          </div>
          <VehicleSpecs vehicle={vehicle} />
          <Separator />

          <div className={cn("space-y-2.5 transition-opacity", loading && quote && "opacity-60")} aria-live="polite">
            {!quote && loading && (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-3 h-7 w-1/2" />
              </>
            )}
            {!quote && !loading && (
              <p className="text-sm text-muted-foreground">{error ? s.adjust : s.choose}</p>
            )}
            {quote && (
              <>
                {lines.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn("font-medium tabular-nums", item.amount < 0 && "text-success")}>
                      {item.amount < 0 ? `- ${peso(-item.amount)}` : peso(item.amount)}
                    </span>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{s.total}</span>
                  <span className="font-heading text-2xl font-semibold tabular-nums">{peso(quote.total_amount)}</span>
                </div>
                <p className="flex gap-1.5 text-xs text-muted-foreground">
                  <InfoIcon className="mt-px size-3.5 shrink-0" />
                  {fmt(s.payNote, { deposit: peso(quote.security_deposit) })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
