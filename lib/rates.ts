import type { VehicleSummary, VehicleCategory, ZoneCode } from "@/lib/types"

export type RateGroup = "sedan" | "mpv" | "suv-pickup" | "van"

export const rateGroups: { key: RateGroup; label: string; seats: string; categories: VehicleCategory[] }[] = [
  { key: "sedan", label: "Sedan", seats: "5 seats", categories: ["sedan"] },
  { key: "mpv", label: "MPV", seats: "7 to 8 seats", categories: ["mpv"] },
  { key: "suv-pickup", label: "SUV & Pickup", seats: "5 to 7 seats", categories: ["suv", "pickup"] },
  { key: "van", label: "Van", seats: "12 to 15 seats", categories: ["van"] },
]

export function groupOf(category: VehicleCategory): RateGroup {
  return rateGroups.find((g) => g.categories.includes(category))?.key ?? "sedan"
}

/** Daily rate for a zone, or null when the car is quoted on request there. */
export function zoneRate(vehicle: VehicleSummary, zone: ZoneCode): number | null {
  return vehicle.zone_rates?.[zone] ?? null
}

/** Rate the booking engine will charge: zone rate, falling back to the base daily rate. */
export function effectiveRate(vehicle: VehicleSummary, zone: ZoneCode): number {
  return zoneRate(vehicle, zone) ?? vehicle.daily_rate
}

export function hasZoneRates(vehicle: VehicleSummary) {
  return Object.keys(vehicle.zone_rates ?? {}).length > 0
}
