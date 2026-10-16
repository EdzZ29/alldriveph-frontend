import { CloudOffIcon } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import LoadingSpinner from "@/components/rareui/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths"
import { reportApiError } from "@/lib/api"
import type { User } from "@/lib/types"

const API_URL = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

/** The signed in user, null for an invalid or expired session, or "unavailable" when the API is down. */
async function sessionUser(token: string): Promise<User | null | "unavailable"> {
  // a couple of quick retries ride out the API restarting in watch mode
  for (const delay of [0, 300, 900]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    try {
      const res = await fetch(`${API_URL}/api/v1/rpc`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ me: {} }),
        signal: AbortSignal.timeout(8_000),
      })
      if (res.status >= 500) continue
      // me is null when the session is invalid or expired
      return res.ok ? (((await res.json()) as { me: User | null }).me ?? null) : null
    } catch {
      // unreachable: try again
    }
  }
  reportApiError(new Error(`API unreachable at ${API_URL} (admin session check)`))
  return "unavailable"
}

async function SessionGate({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("adp_session")?.value
  if (!token) redirect(ADMIN_LOGIN_PATH)

  const user = await sessionUser(token)
  // keep the session when the API is only down; the staff member can retry once it is back
  if (user === "unavailable") {
    return (
      <div className="grid min-h-svh place-items-center p-6">
        <Empty className="max-w-md rounded-2xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CloudOffIcon />
            </EmptyMedia>
            <EmptyTitle>The booking server is not responding</EmptyTitle>
            <EmptyDescription>Your session is safe. Wait a moment, then try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/admin" prefetch={false}>
                Try again
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }
  if (!user) redirect("/admin/logout")

  return <AdminShell user={user}>{children}</AdminShell>
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center">
          <LoadingSpinner label="Loading dashboard" />
        </div>
      }
    >
      <SessionGate>{children}</SessionGate>
    </Suspense>
  )
}
