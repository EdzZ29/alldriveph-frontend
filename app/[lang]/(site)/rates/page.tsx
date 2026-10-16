import { ArrowUpRightIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { RatesExplorer } from "@/components/rates/rates-explorer"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { CtaBanner } from "@/components/site/cta-banner"
import { PageHeader } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.rates.meta.title, description: t.rates.meta.description, alternates: alternatesFor(lang, "/rates") }
}

async function Rates() {
  const [vehicles, meta] = await Promise.all([safeLoad(() => api.vehicles()), safeLoad(api.meta)])
  const { t } = await getI18n()
  if (vehicles.error || meta.error) return <ApiErrorState title={t.rates.loadError} />
  return <RatesExplorer vehicles={vehicles.data} meta={meta.data} showMap />
}

export default async function RatesPage() {
  const { t } = await getI18n()
  const h = t.rates.header
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} title={h.title} description={h.description}>
        <Button asChild size="xl" className="rounded-full">
          <Link href="/fleet">
            {h.cta} <ArrowUpRightIcon />
          </Link>
        </Button>
      </PageHeader>
      <section className="container-page relative z-10 -mt-10 sm:-mt-12">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-[1.75rem]" />}>
          <Rates />
        </Suspense>
      </section>
      <CtaBanner />
    </>
  )
}
