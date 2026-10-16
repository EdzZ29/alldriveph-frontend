import type { Metadata } from "next"

import { ChatInbox } from "@/components/admin/pages/chats"

export const metadata: Metadata = { title: "Chats" }

export default function Page() {
  return <ChatInbox />
}
