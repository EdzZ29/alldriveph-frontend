import type { Metadata } from "next"

import { CommissionsManager } from "@/components/admin/pages/commissions"

export const metadata: Metadata = { title: "Commissions" }

export default function Page() {
  return <CommissionsManager />
}
