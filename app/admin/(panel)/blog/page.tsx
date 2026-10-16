import type { Metadata } from "next"

import { BlogManager } from "@/components/admin/pages/content-managers"

export const metadata: Metadata = { title: "Blog" }

export default function Page() {
  return <BlogManager />
}
