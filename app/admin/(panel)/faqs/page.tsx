import type { Metadata } from "next"

import { FaqsManager } from "@/components/admin/pages/content-managers"

export const metadata: Metadata = { title: "FAQs" }

export default function Page() {
  return <FaqsManager />
}
