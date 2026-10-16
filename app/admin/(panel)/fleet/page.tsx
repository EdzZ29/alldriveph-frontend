import type { Metadata } from "next"

import { FleetManager } from "@/components/admin/pages/content-managers"

export const metadata: Metadata = { title: "Fleet" }

export default function Page() {
  return <FleetManager />
}
