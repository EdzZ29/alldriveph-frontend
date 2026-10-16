import type { Metadata } from "next"

import { AccountSettings } from "@/components/admin/pages/account"

export const metadata: Metadata = { title: "Account" }

export default function Page() {
  return <AccountSettings />
}
