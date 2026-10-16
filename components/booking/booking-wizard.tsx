"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  KeyRoundIcon,
  UserRoundIcon,
} from "lucide-react"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { BookingSuccess } from "@/components/booking/booking-success"
import { addDaysKey, DateTimeField, useDefaultTrip } from "@/components/booking/date-time-field"
import { DestinationSelect } from "@/components/booking/destination-select"
import { LocationSelect } from "@/components/booking/location-select"
import { branchOffices, branchShort, officeCode } from "@/lib/branch-labels"
import { PriceSummary } from "@/components/booking/price-summary"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, call } from "@/lib/client-api"
import { peso, toManilaIso } from "@/lib/format"
import { fmt, intlLocale } from "@/lib/i18n/config"
import { zoneLabel } from "@/lib/i18n/labels"
import type { Messages } from "@/lib/i18n/messages"
import { effectiveRate, hasZoneRates } from "@/lib/rates"
import type { Booking, Meta, Quote, ServiceType, Vehicle, ZoneCode } from "@/lib/types"
import { cn } from "@/lib/utils"

const STEP_KEYS = ["trip", "details", "review"] as const

// the trip starts at the car's own branch city unless the visitor picks somewhere else
const BRANCH_CITY: Record<string, string> = {
  butuan: "Butuan City",
  "cagayan-de-oro": "Cagayan de Oro City",
  davao: "Davao City",
}
const ISO_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/

function makeDetailsSchema(v: Messages["booking"]["validation"]) {
  return z.object({
  customer_name: z.string().trim().min(2, v.name),
  customer_email: z.email(v.email),
  customer_phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s\-()]{6,20}$/, v.phone),
  license_number: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(1000).optional(),
  accept_terms: z.boolean().refine((checked) => checked, v.terms),
  })
}

type Details = z.infer<ReturnType<typeof makeDetailsSchema>>

export function BookingWizard({ vehicle, meta }: { vehicle: Vehicle; meta: Meta }) {
  const search = useSearchParams()
  const { t, lang } = useI18n()
  const b = t.booking
  const detailsSchema = useMemo(() => makeDetailsSchema(b.validation), [b.validation])
  const [step, setStep] = useState(0)
  const [booking, setBooking] = useState<Booking | null>(null)

  // ----- trip -----
  // the customer picks a branch; cars are collected at their home branch and can be returned to any branch
  const branches = branchOffices(meta.locations)
  const homeOffice = branches.find((l) => l.branch_code === vehicle.branch)?.code ?? branches[0]?.code ?? ""
  const linked = officeCode(meta.locations, search.get("location"))
  const initialLocation = linked && branches.some((l) => l.code === linked && l.branch_code === vehicle.branch) ? linked : homeOffice
  const [pickupLocation, setPickupLocation] = useState(initialLocation)
  const [returnLocation, setReturnLocation] = useState(initialLocation)
  const [sameReturn, setSameReturn] = useState(true)
  // optional exact spots within the branch area (hotel, landmark, address)
  const [pickupAddress, setPickupAddress] = useState("")
  const [returnAddress, setReturnAddress] = useState("")
  const fromParam = ISO_RE.exec(search.get("from") ?? "")
  const toParam = ISO_RE.exec(search.get("to") ?? "")
  const fromUrl = fromParam && toParam ? { from: fromParam, to: toParam } : null
  const defaults = useDefaultTrip()
  const [pickedPickup, setPickupDate] = useState(fromUrl?.from[1] ?? "")
  const [pickupTime, setPickupTime] = useState(fromUrl?.from[2] ?? "09:00")
  const [pickedReturn, setReturnDate] = useState(fromUrl?.to[1] ?? "")
  const [returnTime, setReturnTime] = useState(fromUrl?.to[2] ?? "09:00")
  const pickupDate = pickedPickup || defaults?.pickupDate || ""
  const returnDate = pickedReturn || defaults?.returnDate || ""
  const [serviceType, setServiceType] = useState<ServiceType>(search.get("service") === "with_driver" ? "with_driver" : "self_drive")
  const branchZones = meta.zones[vehicle.branch] ?? []
  const allPlaces = branchZones.flatMap((z) => z.groups.flatMap((g) => g.places.map((place) => ({ place, zone: z.code }))))
  const placeParam = search.get("destination")
  const [destination, setDestination] = useState(
    allPlaces.some((p) => p.place === placeParam) ? (placeParam as string) : (BRANCH_CITY[vehicle.branch] ?? allPlaces[0]?.place ?? "")
  )
  const destinationZone: ZoneCode = allPlaces.find((p) => p.place === destination)?.zone ?? "local"
  const rateFor = (zone: ZoneCode) => (hasZoneRates(vehicle) ? effectiveRate(vehicle, zone) : zone === "local" ? vehicle.daily_rate : null)

  const trip = useMemo(() => {
    if (!pickupDate || !returnDate) return null
    return {
      vehicle_id: vehicle.id,
      pickup_at: toManilaIso(pickupDate, pickupTime),
      return_at: toManilaIso(returnDate, returnTime),
      pickup_location: pickupLocation,
      return_location: sameReturn ? pickupLocation : returnLocation,
      service_type: serviceType,
      destination,
      destination_zone: destinationZone,
    }
  }, [vehicle.id, pickupDate, pickupTime, returnDate, returnTime, pickupLocation, returnLocation, sameReturn, serviceType, destination, destinationZone])

  // ----- live quote -----
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quotedKey, setQuotedKey] = useState<string | null>(null)
  const tripKey = trip ? JSON.stringify(trip) : null
  const quoting = !!tripKey && tripKey !== quotedKey
  const quoteSeq = useRef(0)

  useEffect(() => {
    if (!trip) return
    const seq = ++quoteSeq.current
    const key = JSON.stringify(trip)
    const timer = setTimeout(async () => {
      try {
        const result = await call<Quote>("quote", trip)
        if (seq !== quoteSeq.current) return
        setQuote(result)
        setQuoteError(result.available ? null : b.quote.unavailable)
      } catch (error) {
        if (seq !== quoteSeq.current) return
        setQuote(null)
        setQuoteError(error instanceof ApiError ? error.message : b.quote.failed)
      } finally {
        if (seq === quoteSeq.current) setQuotedKey(key)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [trip, b.quote])

  // ----- details form -----
  const form = useForm<Details>({
    resolver: zodResolver(detailsSchema),
    mode: "onTouched",
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      license_number: "",
      notes: "",
      accept_terms: false,
    },
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const tripReady = !!trip && !!quote && !quoteError && !quoting

  const goToReview = form.handleSubmit((values) => {
    if (serviceType === "self_drive" && !values.license_number) {
      form.setError("license_number", { message: b.validation.license })
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  })

  const submit = async () => {
    if (!trip) return
    setSubmitting(true)
    setSubmitError(null)
    const values = form.getValues()
    try {
      const created = await call<Booking>("create_booking", {
        input: {
          ...trip,
          ...values,
          license_number: serviceType === "self_drive" ? values.license_number : values.license_number || null,
          notes: values.notes || null,
          pickup_address: pickupAddress.trim() || null,
          return_address: returnAddress.trim() || null,
        },
      })
      setBooking(created)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : b.review.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  if (booking) return <BookingSuccess booking={booking} meta={meta} />

  const locationName = (code: string) => meta.locations.find((l) => l.code === code)?.name ?? code

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-6">
        <Stepper step={step} onStep={(i) => i < step && setStep(i)} labels={STEP_KEYS.map((k) => b.steps[k])} ariaLabel={b.progress} />

        <div className="rounded-2xl border bg-card p-5 sm:p-7">
          {step === 0 && (
            <FieldGroup>
              <div>
                <h2 className="text-xl font-semibold">{b.trip.heading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fmt(b.trip.intro, { hours: meta.policies.min_rental_hours })}
                </p>
              </div>

              <Field>
                <FieldLabel>{b.trip.travel}</FieldLabel>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={b.trip.serviceAria}>
                  {(
                    [
                      { value: "self_drive", icon: KeyRoundIcon, title: t.common.serviceTypes.self_drive, text: b.trip.selfDriveText },
                      { value: "with_driver", icon: UserRoundIcon, title: t.common.serviceTypes.with_driver, text: fmt(b.trip.withDriverText, { rate: peso(vehicle.driver_rate) }) },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={serviceType === opt.value}
                      onClick={() => setServiceType(opt.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                        serviceType === opt.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/60"
                      )}
                    >
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", serviceType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <opt.icon className="size-4.5" />
                      </span>
                      <span>
                        <span className="block font-medium">{opt.title}</span>
                        <span className="block text-sm text-muted-foreground">{opt.text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="destination">{b.trip.destination}</FieldLabel>
                <DestinationSelect
                  id="destination"
                  zones={branchZones}
                  value={destination}
                  onChange={(place) => setDestination(place)}
                  rateFor={rateFor}
                />
                <FieldDescription>{b.trip.destinationHelp}</FieldDescription>
                {!hasZoneRates(vehicle) && destinationZone !== "local" && (
                  <p className="text-sm text-muted-foreground">{b.trip.vanNote}</p>
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="pickup-location">{b.trip.pickupLocation}</FieldLabel>
                  <LocationSelect
                    id="pickup-location"
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    locations={branches}
                    unavailable={(l) => (l.branch_code === vehicle.branch ? null : fmt(b.location.notHere, { branch: branchShort[vehicle.branch] }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="return-location">{b.trip.returnLocation}</FieldLabel>
                  {sameReturn ? (
                    <div className="flex h-11 items-center rounded-xl border border-dashed px-3 text-sm text-muted-foreground">
                      {b.trip.sameAsPickup}
                    </div>
                  ) : (
                    <LocationSelect id="return-location" value={returnLocation} onChange={setReturnLocation} locations={branches} />
                  )}
                </Field>
              </div>
              <Field orientation="horizontal">
                <Checkbox
                  id="same-return"
                  checked={sameReturn}
                  onCheckedChange={(v) => {
                    setSameReturn(v === true)
                    if (v !== true) setReturnLocation(pickupLocation)
                  }}
                />
                <FieldLabel htmlFor="same-return" className="font-normal">
                  {b.trip.sameReturn}
                </FieldLabel>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="pickup-address">
                    {b.trip.pickupAddress} <span className="font-normal text-muted-foreground">({b.trip.optional})</span>
                  </FieldLabel>
                  <Input
                    id="pickup-address"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder={b.trip.addressPlaceholder}
                    maxLength={300}
                    autoComplete="street-address"
                    className="h-11 rounded-xl"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="return-address">
                    {b.trip.returnAddress} <span className="font-normal text-muted-foreground">({b.trip.optional})</span>
                  </FieldLabel>
                  <Input
                    id="return-address"
                    value={returnAddress}
                    onChange={(e) => setReturnAddress(e.target.value)}
                    placeholder={b.trip.returnAddressPlaceholder}
                    maxLength={300}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <FieldDescription className="sm:col-span-2">{b.trip.addressHelp}</FieldDescription>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="pickup-date">{b.trip.pickupDateTime}</FieldLabel>
                  <DateTimeField
                    id="pickup-date"
                    date={pickupDate}
                    time={pickupTime}
                    onDateChange={(v) => {
                      setPickupDate(v)
                      if (!returnDate || returnDate <= v) setReturnDate(addDaysKey(v, 1))
                    }}
                    onTimeChange={setPickupTime}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="return-date">{b.trip.returnDateTime}</FieldLabel>
                  <DateTimeField
                    id="return-date"
                    date={returnDate}
                    time={returnTime}
                    minDate={pickupDate || undefined}
                    onDateChange={setReturnDate}
                    onTimeChange={setReturnTime}
                  />
                </Field>
              </div>

              {quoteError && <InlineAlert>{quoteError}</InlineAlert>}
            </FieldGroup>
          )}

          {step === 1 && (
            <form id="details-form" onSubmit={goToReview} noValidate>
              <FieldGroup>
                <div>
                  <h2 className="text-xl font-semibold">{b.details.heading}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{b.details.intro}</p>
                </div>
                <TextField control={form.control} name="customer_name" label={b.details.fullName} autoComplete="name" placeholder="Juan Dela Cruz" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField control={form.control} name="customer_email" label={b.details.email} type="email" autoComplete="email" placeholder="you@example.com" />
                  <TextField control={form.control} name="customer_phone" label={b.details.mobile} type="tel" autoComplete="tel" placeholder="+63 917 123 4567" />
                </div>
                {serviceType === "self_drive" && (
                  <TextField
                    control={form.control}
                    name="license_number"
                    label={b.details.license}
                    placeholder="N01-23-456789"
                    description={b.details.licenseHelp}
                  />
                )}
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="notes">
                        {b.details.notes} <span className="font-normal text-muted-foreground">{b.details.optional}</span>
                      </FieldLabel>
                      <Textarea id="notes" rows={3} placeholder={b.details.notesPlaceholder} {...field} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="accept_terms"
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <Checkbox id="accept-terms" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} aria-invalid={fieldState.invalid} />
                      <div className="space-y-1">
                        <FieldLabel htmlFor="accept-terms" className="font-normal">
                          <span>
                            {b.details.termsPrefix}{" "}
                            <Link href="/terms" target="_blank" className="font-medium text-brand-strong underline underline-offset-4">
                              {b.details.termsLink}
                            </Link>{" "}
                            {b.details.termsAnd}{" "}
                            <Link href="/privacy-policy" target="_blank" className="font-medium text-brand-strong underline underline-offset-4">
                              {b.details.privacyLink}
                            </Link>
                            .
                          </span>
                        </FieldLabel>
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          )}

          {step === 2 && trip && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{b.review.heading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{b.review.intro}</p>
              </div>
              <dl className="grid gap-4 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
                <ReviewItem label={b.review.service}>
                  {t.common.serviceTypes[serviceType]}
                  <br />
                  <span className="text-muted-foreground">
                    {fmt(b.review.goingTo, { place: destination, zone: zoneLabel(t, branchZones.find((z) => z.code === destinationZone)?.name ?? "") })}
                  </span>
                </ReviewItem>
                <ReviewItem label={b.review.pickup}>
                  {locationName(trip.pickup_location)}
                  {pickupAddress.trim() && <span className="block">{pickupAddress.trim()}</span>}
                  <br />
                  <span className="text-muted-foreground">{new Date(trip.pickup_at).toLocaleString(intlLocale[lang], { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })}</span>
                </ReviewItem>
                <ReviewItem label={b.review.return}>
                  {locationName(trip.return_location)}
                  {(returnAddress.trim() || (sameReturn && pickupAddress.trim())) && (
                    <span className="block">{returnAddress.trim() || pickupAddress.trim()}</span>
                  )}
                  <br />
                  <span className="text-muted-foreground">{new Date(trip.return_at).toLocaleString(intlLocale[lang], { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })}</span>
                </ReviewItem>
                <ReviewItem label={b.review.driver}>
                  {form.getValues("customer_name")}
                  <br />
                  <span className="text-muted-foreground">
                    {form.getValues("customer_email")} · {form.getValues("customer_phone")}
                  </span>
                </ReviewItem>
              </dl>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  b.review.next1,
                  b.review.next2,
                  fmt(b.review.next3, { deposit: peso(meta.policies.security_deposit) }),
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
              {submitError && <InlineAlert>{submitError}</InlineAlert>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
            {step > 0 ? (
              <Button type="button" variant="ghost" size="xl" onClick={back} disabled={submitting}>
                <ArrowLeftIcon /> {t.common.actions.back}
              </Button>
            ) : (
              <span />
            )}
            {step === 0 && (
              <Button type="button" size="xl" onClick={next} disabled={!tripReady}>
                {quoting && <Spinner />} {t.common.actions.continue} <ArrowRightIcon />
              </Button>
            )}
            {step === 1 && (
              <Button type="submit" form="details-form" size="xl" disabled={!tripReady}>
                {b.buttons.review} <ArrowRightIcon />
              </Button>
            )}
            {step === 2 && (
              <Button type="button" size="xl" onClick={submit} disabled={submitting || !tripReady}>
                {submitting ? <Spinner /> : <CheckIcon />} {b.buttons.confirm}
              </Button>
            )}
          </div>
        </div>
      </div>

      <PriceSummary
        vehicle={vehicle}
        quote={quote}
        loading={quoting}
        error={quoteError}
        place={destination}
        discountPercent={Math.round(meta.policies.long_rental_discount * 100)}
      />
    </div>
  )
}

function Stepper({ step, onStep, labels, ariaLabel }: { step: number; onStep: (i: number) => void; labels: string[]; ariaLabel: string }) {
  return (
    <ol className="flex items-center gap-2" aria-label={ariaLabel}>
      {labels.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              onClick={() => onStep(i)}
              disabled={!done}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary text-brand-strong ring-4 ring-primary/15",
                  !done && !current && "text-muted-foreground"
                )}
              >
                {done ? <CheckIcon className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", current ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            </button>
            {i < labels.length - 1 && <span className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />}
          </li>
        )
      })}
    </ol>
  )
}


function TextField({
  control,
  name,
  label,
  description,
  ...props
}: {
  control: ReturnType<typeof useForm<Details>>["control"]
  name: "customer_name" | "customer_email" | "customer_phone" | "license_number"
  label: string
  description?: string
} & Omit<React.ComponentProps<typeof Input>, "name" | "form">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input id={name} className="h-11 rounded-xl" aria-invalid={fieldState.invalid} {...props} {...field} value={field.value ?? ""} />
          {description && !fieldState.error && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function ReviewItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  )
}

function InlineAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
