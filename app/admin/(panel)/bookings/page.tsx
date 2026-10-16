import type { Metadata } from "next"

import { BookingsManager } from "@/components/admin/pages/bookings"

export const metadata: Metadata = { title: "Bookings" }

export default function Page() {
  return <BookingsManager />
}
