"use client"

import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { addDaysKey, DateTimeField, useDefaultTrip } from "@/components/booking/date-time-field"
import { fieldLabel } from "@/components/booking/field-styles"
import { LocationSelect } from "@/components/booking/location-select"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/provider"
import { Label } from "@/components/ui/label"
import { branchOffices } from "@/lib/branch-labels"
import { toManilaIso } from "@/lib/format"
import type { Location } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TripSearch({ locations: all, branch, className }: { locations: Location[]; branch?: string; className?: string }) {
  const locations = branchOffices(all)
  const router = useRouter()
  const { t, href } = useI18n()
  const s = t.booking
  const [location, setLocation] = useState((locations.find((l) => l.branch_code === branch) ?? locations[0])?.code ?? "")
  const defaults = useDefaultTrip()
  const [pickedPickup, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("09:00")
  const [pickedReturn, setReturnDate] = useState("")
  const pickupDate = pickedPickup || defaults?.pickupDate || ""
  const returnDate = pickedReturn || defaults?.returnDate || ""
  const [returnTime, setReturnTime] = useState("09:00")
  const [error, setError] = useState<string | null>(null)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!pickupDate || !returnDate) return setError(s.search.errorDates)
    const from = toManilaIso(pickupDate, pickupTime)
    const to = toManilaIso(returnDate, returnTime)
    if (new Date(to) <= new Date(from)) return setError(s.search.errorOrder)
    setError(null)
    const params = new URLSearchParams({ from, to, location })
    router.push(href(`/fleet?${params.toString()}`))
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-[1.4rem] border bg-card p-3 text-card-foreground shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] sm:p-4",
        className
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_auto] lg:items-start">
        {/* every column is label + 48px control and aligns from the top, so nothing can push one up */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Label htmlFor="search-location" className={fieldLabel}>
            {s.trip.pickupLocation}
          </Label>
          <LocationSelect id="search-location" value={location} onChange={setLocation} locations={locations} />
        </div>
        <div className="relative">
          <Label htmlFor="search-pickup" className={fieldLabel}>
            {s.review.pickup}
          </Label>
          <DateTimeField
            id="search-pickup"
            date={pickupDate}
            time={pickupTime}
            onDateChange={(value) => {
              setPickupDate(value)
              if (!returnDate || returnDate <= value) setReturnDate(addDaysKey(value, 1))
            }}
            onTimeChange={setPickupTime}
          />
        </div>
        <div className="relative">
          <Label htmlFor="search-return" className={fieldLabel}>
            {s.review.return}
          </Label>
          <DateTimeField
            id="search-return"
            date={returnDate}
            time={returnTime}
            minDate={pickupDate || undefined}
            onDateChange={setReturnDate}
            onTimeChange={setReturnTime}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          {/* empty label row keeps the button level with the fields */}
          <span className={cn(fieldLabel, "max-lg:hidden")} aria-hidden>
            &nbsp;
          </span>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl px-6 text-base font-semibold shadow-[0_10px_24px_-10px] shadow-primary/70 lg:w-auto"
          >
            <SearchIcon /> {s.search.find}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="px-1 pt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
