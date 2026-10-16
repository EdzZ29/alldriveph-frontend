import type { Metadata } from "next"
import { Suspense } from "react"

import { TrackBooking } from "@/components/booking/track-booking"
import { PageHeader } from "@/components/site/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.track.meta.title, description: t.track.meta.description, alternates: alternatesFor(lang, "/track") }
}

export default async function TrackPage() {
  const { t } = await getI18n()
  return (
    <>
      <PageHeader
        eyebrow={t.track.header.eyebrow}
        title={t.track.header.title}
        description={t.track.header.description}
      />
      <section className="container-page py-12 sm:py-16">
        <Suspense fallback={<Skeleton className="mx-auto h-32 max-w-4xl rounded-2xl" />}>
          <TrackBooking />
        </Suspense>
      </section>
    </>
  )
}
