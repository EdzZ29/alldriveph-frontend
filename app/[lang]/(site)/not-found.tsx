import { ArrowLeftIcon, CarFrontIcon } from "lucide-react"

import Link from "@/components/i18n/link"
import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"

export default async function NotFound() {
  const { t } = await getI18n()
  const n = t.common.notFound
  return (
    <section className="container-page flex flex-col items-center gap-5 py-28 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-ink text-primary">
        <CarFrontIcon className="size-6" />
      </span>
      <p className="font-heading text-6xl font-extrabold tracking-tighter text-brand-strong">404</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{n.title}</h1>
      <p className="max-w-md text-muted-foreground">{n.body}</p>
      <Button asChild size="xl" className="rounded-full">
        <Link href="/">
          <ArrowLeftIcon /> {n.home}
        </Link>
      </Button>
    </section>
  )
}
