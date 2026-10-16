import { defaultLocale, intlLocale, type Locale } from "@/lib/i18n/config"
import { TIME_ZONE, TZ_OFFSET } from "@/lib/site"
import type { BookingStatus, ServiceType, VehicleCategory } from "@/lib/types"

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

export function peso(amount: number) {
  return pesoFormatter.format(amount)
}

export function formatDateTime(iso: string, lang: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatDate(iso: string, lang: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    timeZone: TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

/** "Oct 17, 9:00 AM" in Philippine time: compact enough for a table cell. */
export function formatShortDateTime(iso: string, lang: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatShortDate(iso: string, lang: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

/** Combine a yyyy-MM-dd date and HH:mm time into an ISO string in Philippine time. */
export function toManilaIso(date: string, time: string) {
  return `${date}T${time}:00${TZ_OFFSET}`
}

/** yyyy-MM-dd for a Date, as seen in Philippine time. */
export function manilaDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

export const categoryLabels: Record<VehicleCategory, string> = {
  sedan: "Sedan",
  suv: "SUV",
  mpv: "MPV",
  pickup: "Pickup",
  van: "Van",
}

export const serviceTypeLabels: Record<ServiceType, string> = {
  self_drive: "Self drive",
  with_driver: "With driver",
}

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ongoing: "On the road",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  ongoing: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
