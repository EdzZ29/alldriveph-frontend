import { CloudOffIcon } from "lucide-react"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { reportApiError } from "@/lib/api"
import { getI18n } from "@/lib/i18n/server"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export async function ApiErrorState({ title }: { title?: string }) {
  const { t } = await getI18n()
  return (
    <Empty className="rounded-2xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudOffIcon />
        </EmptyMedia>
        <EmptyTitle>{title ?? t.common.errors.loadTitle}</EmptyTitle>
        <EmptyDescription>{t.common.errors.loadBody}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

/** Runs a loader and renders a friendly error state instead of crashing the page. */
export async function safeLoad<T>(loader: () => Promise<T>): Promise<{ data: T; error: false } | { data: null; error: true }> {
  try {
    return { data: await loader(), error: false }
  } catch (error) {
    unstable_rethrow(error)
    // never bake an outage into a prerendered page: during a build or background revalidation this
    // turns the section into a request time hole, so a visitor after the API recovers sees real data
    await connection()
    reportApiError(error)
    return { data: null, error: true }
  }
}
