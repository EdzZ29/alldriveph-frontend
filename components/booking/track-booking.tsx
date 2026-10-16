"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, SearchIcon, XCircleIcon } from "lucide-react"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CarImage } from "@/components/site/vehicle-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ApiError, call } from "@/lib/client-api"
import { formatDateTime, peso, statusStyles } from "@/lib/format"
import type { Messages } from "@/lib/i18n/messages"
import { site } from "@/lib/site"
import type { Booking, BookingNotice, BookingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

function makeSchema(f: Messages["track"]["form"]) {
  return z.object({
    reference: z.string().trim().min(6, f.referenceError),
    email: z.email(f.emailError),
  })
}
type Values = z.infer<ReturnType<typeof makeSchema>>

const TIMELINE: BookingStatus[] = ["pending", "confirmed", "ongoing", "completed"]


export function TrackBooking() {
  const params = useSearchParams()
  const { t } = useI18n()
  const f = t.track.form
  const schema = useMemo(() => makeSchema(f), [f])
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { reference: params.get("ref") ?? "", email: params.get("email") ?? "" },
  })

  const genericError = t.common.errors.generic
  const lookup = useCallback(async (values: Values) => {
    try {
      setBooking(await call<Booking>("track_booking", values))
      setError(null)
    } catch (err) {
      setBooking(null)
      setError(err instanceof ApiError ? err.message : genericError)
    }
  }, [genericError])

  // while a booking is on screen, staff confirming or cancelling it updates the page at once
  const reference = booking?.reference
  const email = booking?.customer_email
  useEffect(() => {
    if (!reference || !email) return
    const query = new URLSearchParams({ booking: reference, email })
    const source = new EventSource(`/api/v1/events?${query}`)
    source.addEventListener("booking", (e) => {
      const { status } = JSON.parse((e as MessageEvent).data) as Pick<BookingNotice, "status">
      setBooking((current) => (current && current.reference === reference ? { ...current, status } : current))
    })
    return () => source.close()
  }, [reference, email])

  useEffect(() => {
    const ref = params.get("ref")
    const email = params.get("email")
    if (!ref || !email) return
    // arriving from a confirmation link: look the booking up right away
    const timer = setTimeout(() => void lookup({ reference: ref, email }), 0)
    return () => clearTimeout(timer)
  }, [params, lookup])

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <form onSubmit={form.handleSubmit(lookup)} className="rounded-2xl border bg-card p-5 sm:p-7" noValidate>
        <FieldGroup className="sm:flex-row sm:items-start">
          <Field data-invalid={!!form.formState.errors.reference}>
            <FieldLabel htmlFor="reference">{f.reference}</FieldLabel>
            <Input id="reference" className="h-11 rounded-xl font-mono uppercase" placeholder="AD-XXXXXXX" {...form.register("reference")} />
            <FieldError errors={[form.formState.errors.reference]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">{f.email}</FieldLabel>
            <Input id="email" type="email" className="h-11 rounded-xl" placeholder="you@example.com" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Button type="submit" size="xl" className="sm:mt-[1.6rem]" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : <SearchIcon />} {f.find}
          </Button>
        </FieldGroup>
        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <XCircleIcon className="size-4" /> {error}
          </p>
        )}
      </form>

      {booking && <BookingDetails booking={booking} />}
    </div>
  )
}

function BookingDetails({ booking }: { booking: Booking }) {
  const { t, lang } = useI18n()
  const d = t.track.details
  const cancelled = booking.status === "cancelled"
  const currentIndex = TIMELINE.indexOf(booking.status)

  return (
    <article className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border bg-card duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5 sm:p-7">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{d.reference}</p>
          <p className="font-mono text-xl font-semibold tracking-wider">{booking.reference}</p>
        </div>
        <Badge variant="outline" className={cn("h-7 px-3 text-sm", statusStyles[booking.status])}>
          {t.common.statuses[booking.status]}
        </Badge>
      </div>

      {!cancelled && (
        <ol className="grid grid-cols-4 gap-2 border-b px-5 py-6 sm:px-7">
          {TIMELINE.map((status, i) => {
            const done = i <= currentIndex
            return (
              <li key={status} className="flex flex-col items-center gap-2 text-center">
                <span className={cn("grid size-8 place-items-center rounded-full border text-xs font-semibold", done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground")}>
                  {done ? <CheckIcon className="size-4" /> : i + 1}
                </span>
                <span className={cn("text-xs sm:text-sm", done ? "font-medium" : "text-muted-foreground")}>{t.common.statuses[status]}</span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="grid gap-6 p-5 sm:grid-cols-[200px_1fr] sm:p-7">
        <div className="car-panel relative aspect-[4/3] rounded-xl">
          <CarImage src={booking.vehicle.image_url} alt={booking.vehicle.name} sizes="200px" className="p-3" />
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">{d.car}</dt>
            <dd className="text-base font-semibold">{booking.vehicle.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{d.pickup}</dt>
            <dd className="font-medium">{formatDateTime(booking.pickup_at, lang)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{d.return}</dt>
            <dd className="font-medium">{formatDateTime(booking.return_at, lang)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{d.service}</dt>
            <dd className="font-medium">{t.common.serviceTypes[booking.service_type]}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{d.total}</dt>
            <dd className="font-heading text-lg font-semibold">{peso(booking.total_amount)}</dd>
          </div>
        </dl>
      </div>
      <div className="border-t bg-muted/30 px-5 py-4 text-sm text-muted-foreground sm:px-7">
        {cancelled ? d.cancelled : booking.status === "pending" ? d.pending : d.changes}{" "}
        {d.call} <a href={site.phoneHref} className="font-medium text-foreground">{site.phone}</a> {d.or}{" "}
        <Link href="/contact" className="font-medium text-foreground underline underline-offset-4">
          {d.message}
        </Link>
        .
      </div>
    </article>
  )
}
