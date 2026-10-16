import { ArrowLeftIcon, LockIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { BookingWizard } from "@/components/booking/booking-wizard"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.booking.meta.title, robots: { index: false } }
}

async function Wizard({ params }: { params: PageProps<"/[lang]/book/[slug]">["params"] }) {
  const { slug } = await params
  const [vehicle, meta] = await Promise.all([safeLoad(() => api.vehicle(slug)), safeLoad(api.meta)])
  if (vehicle.error || meta.error) return <ApiErrorState />

  if (!vehicle.data) notFound()
  return <BookingWizard vehicle={vehicle.data} meta={meta.data} />
}

function WizardSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[520px] rounded-2xl" />
      </div>
      <Skeleton className="h-[460px] rounded-2xl" />
    </div>
  )
}

export default async function BookPage({ params }: PageProps<"/[lang]/book/[slug]">) {
  const { t } = await getI18n()
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" className="-ml-2 text-muted-foreground">
          <Link href="/fleet">
            <ArrowLeftIcon /> {t.booking.page.changeCar}
          </Link>
        </Button>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LockIcon className="size-3.5" /> {t.booking.page.secure}
        </p>
      </div>
      <Suspense fallback={<WizardSkeleton />}>
        <Wizard params={params} />
      </Suspense>
    </div>
  )
}
