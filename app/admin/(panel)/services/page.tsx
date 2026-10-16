import type { Metadata } from "next"

import { ServicesManager } from "@/components/admin/pages/content-managers"

export const metadata: Metadata = { title: "Services" }

export default function Page() {
  return <ServicesManager />
}
