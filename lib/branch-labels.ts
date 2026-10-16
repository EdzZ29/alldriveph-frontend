import type { BranchCode, Location } from "@/lib/types"

export const branchShort: Record<BranchCode, string> = {
  butuan: "Butuan",
  "cagayan-de-oro": "CDO",
  davao: "Davao",
}

/** One pickup point per branch: the branch office in the city (the API lists it before the airport). */
export function branchOffices(locations: Location[]) {
  const seen = new Set<string>()
  return locations.filter((l) => !seen.has(l.branch_code) && seen.add(l.branch_code))
}

/** The branch office for any pickup code, so older links with an airport code still resolve. */
export function officeCode(locations: Location[], code: string | null) {
  const branch = locations.find((l) => l.code === code)?.branch_code
  return branch ? branchOffices(locations).find((l) => l.branch_code === branch)?.code : undefined
}
