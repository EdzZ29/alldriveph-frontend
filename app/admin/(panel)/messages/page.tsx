import type { Metadata } from "next"

import { MessagesInbox } from "@/components/admin/pages/messages"

export const metadata: Metadata = { title: "Messages" }

export default function Page() {
  return <MessagesInbox />
}
