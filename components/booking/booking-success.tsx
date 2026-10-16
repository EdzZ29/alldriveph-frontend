"use client"

import { CheckIcon, CopyIcon, MailIcon, PhoneIcon } from "lucide-react"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatDateTime, peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import { site } from "@/lib/site"
import type { Booking, Meta } from "@/lib/types"

export function BookingSuccess({ booking, meta }: { booking: Booking; meta: Meta }) {
  const [copied, setCopied] = useState(false)
  const { t, lang } = useI18n()
  const s = t.booking.success
  const location = (code: string) => meta.locations.find((l) => l.code === code)?.name ?? code

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference)
      setCopied(true)
      toast.success(s.copied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(s.copyFailed)
    }
  }

  const trackHref = `/track?${new URLSearchParams({ ref: booking.reference, email: booking.customer_email })}`

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-3xl border bg-card p-6 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success ring-8 ring-success/5">
          <CheckIcon className="size-8" strokeWidth={2.5} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold">{s.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {fmt(s.thanks, { name: booking.customer_name.split(" ")[0], car: booking.vehicle.name })}
        </p>

        <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/40 p-4">
          <div className="text-left">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{s.reference}</p>
            <p className="font-mono text-2xl font-semibold tracking-wider">{booking.reference}</p>
          </div>
          <Button variant="outline" size="icon-lg" onClick={copy} aria-label={s.copyAria}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>

        <dl className="mt-8 grid gap-4 rounded-2xl bg-muted/40 p-5 text-left text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t.booking.review.pickup}</dt>
            <dd className="font-medium">{formatDateTime(booking.pickup_at, lang)}</dd>
            <dd className="text-muted-foreground">{location(booking.pickup_location)}</dd>
            {booking.pickup_address && <dd className="text-muted-foreground">{booking.pickup_address}</dd>}
          </div>
          <div>
            <dt className="text-muted-foreground">{t.booking.review.return}</dt>
            <dd className="font-medium">{formatDateTime(booking.return_at, lang)}</dd>
            <dd className="text-muted-foreground">{location(booking.return_location)}</dd>
            {booking.return_address && <dd className="text-muted-foreground">{booking.return_address}</dd>}
          </div>
          <div>
            <dt className="text-muted-foreground">{s.destination}</dt>
            <dd className="font-medium">{booking.destination ?? zoneLabel(t, (meta.zones[booking.vehicle.branch] ?? []).find((z) => z.code === booking.destination_zone)?.name ?? "")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{s.duration}</dt>
            <dd className="font-medium">
              {booking.days} {booking.days === 1 ? t.common.units.day : t.common.units.days}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{s.estimatedTotal}</dt>
            <dd className="font-heading text-lg font-semibold">{peso(booking.total_amount)}</dd>
          </div>
        </dl>

        <div className="mt-8 space-y-3 text-left">
          <h2 className="font-sans text-sm font-semibold">{s.nextTitle}</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              s.step1,
              s.step2,
              s.step3,
            ].map((text, i) => (
              <li key={text} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-brand-strong">{i + 1}</span>
                {text}
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-foreground">
            <MailIcon className="size-4 shrink-0 text-brand-strong" />
            {fmt(s.emailNote, { email: booking.customer_email })}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="xl">
            <Link href={trackHref}>{s.track}</Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/">{t.common.notFound.home}</Link>
          </Button>
        </div>
      </div>

      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {s.needChange}
        <a href={site.phoneHref} className="flex items-center gap-1.5 font-medium text-foreground">
          <PhoneIcon className="size-4" /> {site.phone}
        </a>
        <a href={`mailto:${site.email}?subject=Booking ${booking.reference}`} className="flex items-center gap-1.5 font-medium text-foreground">
          <MailIcon className="size-4" /> {site.email}
        </a>
      </p>
    </div>
  )
}
