import type { Metadata } from "next"

import { Providers } from "@/components/providers"
import { fontVariables } from "@/lib/fonts"
import { site } from "@/lib/site"
import "../globals.css"

// The admin panel is for staff and stays in English, so it has its own root layout.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Admin", template: "%s | Alldrive Admin" },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
