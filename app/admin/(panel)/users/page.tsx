import type { Metadata } from "next"

import { TeamManager } from "@/components/admin/pages/team"

export const metadata: Metadata = { title: "Team" }

export default function Page() {
  return <TeamManager />
}
