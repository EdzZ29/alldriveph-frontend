"use client"

import { CalendarIcon, ClockIcon } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { fieldFocusWithin, fieldShell } from "@/components/booking/field-styles"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n/provider"
import { intlLocale, type Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const minutes = 6 * 60 + i * 30 // 6:00 AM to 10:00 PM
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
  return { value, label }
})

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatKey(key: string, lang: Locale) {
  return parseKey(key).toLocaleDateString(intlLocale[lang], { weekday: "short", month: "short", day: "numeric" })
}

export function DateTimeField({
  id,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  invalid,
  className,
}: {
  id: string
  date: string
  time: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  minDate?: string
  invalid?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const { t, lang } = useI18n()
  // only computed once the calendar is opened, never during prerendering
  const earliest = open ? (minDate ? parseKey(minDate) : new Date(new Date().setHours(0, 0, 0, 0))) : undefined

  return (
    // date and time share one outlined control, split by a divider
    <div className={cn(fieldShell, fieldFocusWithin, "flex items-stretch", invalid && "border-destructive ring-3 ring-destructive/20", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-l-[inherit] px-3 text-left whitespace-nowrap outline-none transition-colors hover:bg-muted/60 aria-expanded:bg-muted/60",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-brand-strong" />
            <span className="truncate">{date ? formatKey(date, lang) : t.booking.dateTime.selectDate}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden rounded-2xl p-1.5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)]" align="start">
          <Calendar
            className="[--cell-size:--spacing(9.5)]"
            mode="single"
            selected={date ? parseKey(date) : undefined}
            defaultMonth={date ? parseKey(date) : earliest}
            disabled={earliest ? { before: earliest } : undefined}
            onSelect={(value) => {
              if (value) {
                onDateChange(toKey(value))
                setOpen(false)
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <span className="my-2.5 w-px shrink-0 bg-border" aria-hidden />
      <Select value={time} onValueChange={onTimeChange}>
        <SelectTrigger
          aria-label={t.booking.dateTime.time}
          className="h-auto! w-[7.75rem] shrink-0 rounded-l-none rounded-r-[inherit] border-0 bg-transparent px-3 shadow-none hover:bg-muted/60 focus-visible:ring-0 aria-expanded:bg-muted/60 dark:bg-transparent dark:hover:bg-muted/40"
        >
          <ClockIcon className="text-brand-strong" />
          <SelectValue placeholder={t.booking.dateTime.time} />
        </SelectTrigger>
        <SelectContent position="popper" align="end" className="max-h-72 min-w-36 rounded-xl">
          {TIME_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Default trip: pickup tomorrow 9:00 AM, return three days later. Call only after mount. */
export function defaultTrip() {
  const pickup = new Date()
  pickup.setDate(pickup.getDate() + 1)
  const ret = new Date(pickup)
  ret.setDate(ret.getDate() + 3)
  return { pickupDate: toKey(pickup), returnDate: toKey(ret), time: "09:00" }
}

const noopSubscribe = () => () => {}

/**
 * Default trip dates as seen by the visitor's clock. Returns null while prerendering
 * on the server, so no request time value leaks into the static shell.
 */
export function useDefaultTrip() {
  const key = useSyncExternalStore(
    noopSubscribe,
    () => {
      const t = defaultTrip()
      return `${t.pickupDate}|${t.returnDate}`
    },
    () => null
  )
  if (!key) return null
  const [pickupDate, returnDate] = key.split("|")
  return { pickupDate, returnDate }
}

export function addDaysKey(key: string, days: number) {
  const d = parseKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}
