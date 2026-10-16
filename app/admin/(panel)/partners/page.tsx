import type { Metadata } from "next"

import { PartnersManager } from "@/components/admin/pages/content-managers"

export const metadata: Metadata = { title: "Partners" }

export default function Page() {
  return <PartnersManager />
}
