"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarIcon,
  CarFrontIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  KeyRoundIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  UndoIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useAdminUser } from "@/components/admin/admin-shell"
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-ui"
import { CarImage } from "@/components/site/vehicle-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { bookingsMetaQuery, bookingsQuery, type BookingsMeta } from "@/lib/admin-queries"
import { branchShort } from "@/lib/branch-labels"
import { call } from "@/lib/client-api"
import { formatDateTime, formatShortDate, formatShortDateTime, peso, serviceTypeLabels } from "@/lib/format"
import type { BookingAdmin, BookingDetail, BookingNotification, BookingStatus, BranchCode } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "ongoing", label: "On the road" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const ACTIONS: Record<BookingStatus, { to: BookingStatus; label: string; icon: typeof CheckIcon; destructive?: boolean }[]> = {
  pending: [
    { to: "confirmed", label: "Confirm booking", icon: CheckIcon },
    { to: "cancelled", label: "Cancel", icon: XIcon, destructive: true },
  ],
  confirmed: [
    { to: "ongoing", label: "Mark as picked up", icon: KeyRoundIcon },
    { to: "cancelled", label: "Cancel", icon: XIcon, destructive: true },
  ],
  ongoing: [{ to: "completed", label: "Mark as returned", icon: UndoIcon }],
  completed: [],
  cancelled: [],
}

const BRANCH_NAMES: Record<BranchCode, string> = { butuan: "Butuan", "cagayan-de-oro": "Cagayan de Oro", davao: "Davao" }

/** The booking reference customers track their booking with, with a copy button. */
function TrackingNumber({ reference, large }: { reference: string; large?: boolean }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      toast.success(`Copied ${reference}`)
    } catch {
      toast.error("Copy failed")
    }
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("font-mono font-semibold", large ? "text-lg" : "text-xs")}>{reference}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy tracking number ${reference}`}
        className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <CopyIcon className="size-3.5" />
      </button>
    </span>
  )
}

/** The page customers check their booking on, opened on this booking; handy to share by chat or SMS. */
function CustomerTrackingLinks({ reference, email }: { reference: string; email: string }) {
  const path = `/track?${new URLSearchParams({ ref: reference, email })}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString())
      toast.success("Tracking link copied")
    } catch {
      toast.error("Copy failed")
    }
  }
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button asChild variant="outline" size="sm">
        <a href={path} target="_blank" rel="noopener noreferrer">
          <ExternalLinkIcon /> Customer tracking page
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copy}>
        <CopyIcon /> Copy tracking link
      </Button>
    </div>
  )
}

/** Confirm or cancel from the table; the customer is emailed in the background. */
function useStatusChange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; reference: string; status: "confirmed" | "cancelled" }) =>
      call<BookingAdmin>("update_booking", { id, input: { status } }),
    onSuccess: (_updated, { reference, status }) => {
      queryClient.invalidateQueries({ queryKey: ["/admin/bookings"] })
      queryClient.invalidateQueries({ queryKey: ["/admin/stats"] })
      toast.success(`${reference} ${status}. Emailing the customer…`)
    },
  })
}

/** Asks before cancelling: the customer is told by email and the car is freed for those dates. */
function CancelBookingDialog({
  booking,
  onClose,
  onConfirm,
  working,
}: {
  booking: { reference: string } | null
  onClose: () => void
  onConfirm: () => void
  working: boolean
}) {
  return (
    <AlertDialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel booking {booking?.reference}?</AlertDialogTitle>
          <AlertDialogDescription>
            The customer is emailed that the booking was cancelled, and the car becomes available for those dates again. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Keep booking</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={working} onClick={onConfirm}>
            {working && <Spinner />} Cancel booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function BookingsManager() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const status = params.get("status") ?? "all"
  const page = Math.max(1, Number(params.get("page")) || 1)
  const openId = params.get("open")
  const [query, setQuery] = useState(params.get("q") ?? "")
  const user = useAdminUser()
  // an owner always sees their own branch; admins and staff can pick one or see them all
  const ownBranch = user.role === "owner" ? user.branch : null
  const branch = ownBranch ?? params.get("branch")

  const setParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "" || (k === "status" && v === "all")) next.delete(k)
      else next.set(k, v)
    }
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  useEffect(() => {
    if (query === (params.get("q") ?? "")) return
    const timer = setTimeout(() => setParams({ q: query.trim() || null, page: null }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const variables = { page, status: status === "all" ? null : status, q: params.get("q") || null, branch: ownBranch ? null : branch }

  const { data, isPending, isFetching } = useQuery({
    ...bookingsQuery(variables),
    placeholderData: keepPreviousData,
  })
  const meta = useQuery(bookingsMetaQuery())
  const quick = useStatusChange()
  const [cancelling, setCancelling] = useState<{ id: string; reference: string } | null>(null)
  const locationName = (code: string) => meta.data?.locations.find((l) => l.code === code)?.name ?? code
  const zoneName = (code: string, branch: BranchCode) => meta.data?.zones[branch]?.find((z) => z.code === code)?.name ?? code

  return (
    <>
      <AdminPageHeader
        title={ownBranch ? `${branchShort[ownBranch]} bookings` : "Bookings"}
        description="Every booking with its tracking number. Confirm new requests, track cars on the road and close out returns."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(v) => setParams({ status: v, page: null })}>
          <TabsList className="h-auto flex-wrap">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row lg:max-w-xl lg:flex-1 lg:justify-end">
          {!ownBranch && (
            <Select value={branch ?? "all"} onValueChange={(v) => setParams({ branch: v === "all" ? null : v, page: null })}>
              <SelectTrigger className="sm:w-48" aria-label="Branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {(Object.keys(BRANCH_NAMES) as BranchCode[]).map((code) => (
                  <SelectItem key={code} value={code}>
                    {BRANCH_NAMES[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <InputGroup className="lg:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Tracking no., name, email or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
            {isFetching && !isPending && (
              <InputGroupAddon align="inline-end">
                <Spinner />
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <Empty className="py-14">
            <EmptyHeader>
              <EmptyTitle>No bookings found</EmptyTitle>
              <EmptyDescription>New bookings from the website appear here instantly.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking no.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Car</TableHead>
                <TableHead className="hidden lg:table-cell">Pickup</TableHead>
                <TableHead className="hidden 2xl:table-cell">Return</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((b) => (
                <TableRow key={b.id} className="cursor-pointer" onClick={() => setParams({ open: b.id })}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <TrackingNumber reference={b.reference} />
                    <p className="mt-0.5 text-xs text-muted-foreground">Booked {formatShortDate(b.created_at)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                    <p className="max-w-48 truncate text-xs text-muted-foreground">{b.customer_email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p>{b.vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {serviceTypeLabels[b.service_type]} · {b.days} {b.days === 1 ? "day" : "days"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {formatShortDateTime(b.pickup_at)}
                    <span className="block text-xs text-muted-foreground">{locationName(b.pickup_location)}</span>
                  </TableCell>
                  <TableCell className="hidden text-sm 2xl:table-cell">
                    {formatShortDateTime(b.return_at)}
                    <span className="block text-xs text-muted-foreground">{locationName(b.return_location)}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{peso(b.total_amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  {/* buttons act on the row without opening the booking window */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setParams({ open: b.id })}>
                        <EyeIcon /> View
                      </Button>
                      {b.status === "pending" && (
                        <Button size="sm" disabled={quick.isPending} onClick={() => quick.mutate({ id: b.id, reference: b.reference, status: "confirmed" })}>
                          <CheckIcon /> Confirm
                        </Button>
                      )}
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={quick.isPending} onClick={() => setCancelling(b)}>
                          <XIcon /> Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {data.total} bookings · page {data.page} of {data.pages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>
                <ChevronLeftIcon /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setParams({ page: String(page + 1) })}>
                Next <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CancelBookingDialog
        booking={cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && quick.mutate({ id: cancelling.id, reference: cancelling.reference, status: "cancelled" }, { onSettled: () => setCancelling(null) })}
        working={quick.isPending}
      />
      <BookingDialog id={openId} onClose={() => setParams({ open: null })} locationName={locationName} zoneName={zoneName} extrasNames={meta.data?.extras} />
    </>
  )
}

function BookingDialog({
  id,
  onClose,
  locationName,
  zoneName,
  extrasNames,
}: {
  id: string | null
  onClose: () => void
  locationName: (code: string) => string
  zoneName: (code: string, branch: BranchCode) => string
  extrasNames?: BookingsMeta["extras"]
}) {
  const queryClient = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { data: booking, isPending } = useQuery({
    queryKey: ["/admin/bookings", "detail", id],
    queryFn: () => call<BookingDetail | null>("booking", { id }),
    enabled: !!id,
  })

  const update = useMutation({
    mutationFn: (input: { status?: BookingStatus; admin_notes?: string }) => call<BookingAdmin>("update_booking", { id, input }),
    onSuccess: (updated, body) => {
      // keep the email history on screen; the live stream refreshes it once the email has gone out
      queryClient.setQueryData<BookingDetail | null>(["/admin/bookings", "detail", id], (old) => (old ? { ...old, ...updated } : old))
      queryClient.invalidateQueries({ queryKey: ["/admin/bookings"] })
      queryClient.invalidateQueries({ queryKey: ["/admin/stats"] })
      toast.success(
        body.status === "confirmed" || body.status === "cancelled"
          ? `Booking ${body.status}. Emailing the customer…`
          : body.status
            ? "Booking status updated"
            : "Notes saved"
      )
    },
  })

  const resend = useMutation({
    mutationFn: () => call<BookingNotification>("resend_booking_email", { id }),
    onSuccess: (notice) => {
      queryClient.invalidateQueries({ queryKey: ["/admin/bookings", "detail", id] })
      if (notice.status === "sent") toast.success(`Email sent to ${notice.recipient}`)
      else toast.error(notice.error ?? "The email could not be sent")
    },
  })

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {isPending || !booking ? (
          <div className="space-y-4 p-6">
            <DialogTitle className="sr-only">Booking details</DialogTitle>
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="sticky top-0 z-10 border-b bg-popover px-6 py-5 pr-12">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tracking no.</p>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="sr-only">Booking {booking.reference}</DialogTitle>
                <TrackingNumber reference={booking.reference} large />
                <StatusBadge status={booking.status} />
              </div>
              <DialogDescription>
                Booked {formatDateTime(booking.created_at)} · {locationName(booking.pickup_location)}
              </DialogDescription>
              <CustomerTrackingLinks reference={booking.reference} email={booking.customer_email} />
            </DialogHeader>

            <div className="grid gap-6 p-6 lg:grid-cols-2">
              {ACTIONS[booking.status].length > 0 && (
                <div className="flex flex-wrap gap-2 lg:col-span-2">
                  {ACTIONS[booking.status].map((action) => (
                    <Button
                      key={action.to}
                      variant={action.destructive ? "destructive" : "default"}
                      disabled={update.isPending}
                      onClick={() => (action.to === "cancelled" ? setConfirmCancel(true) : update.mutate({ status: action.to }))}
                    >
                      <action.icon /> {action.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="font-sans text-sm font-semibold">Customer</h3>
                  <div className="space-y-2 rounded-xl border p-4 text-sm">
                    <p className="font-medium">{booking.customer_name}</p>
                    <a href={`tel:${booking.customer_phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <PhoneIcon className="size-4" /> {booking.customer_phone}
                    </a>
                    <a href={`mailto:${booking.customer_email}?subject=Your Alldrive booking ${booking.reference}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <MailIcon className="size-4" /> {booking.customer_email}
                    </a>
                    {booking.license_number && <p className="text-muted-foreground">License: {booking.license_number}</p>}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-sans text-sm font-semibold">Trip</h3>
                  <div className="flex gap-3 rounded-xl border p-3">
                    <span className="car-panel relative h-14 w-20 shrink-0 rounded-lg">
                      <CarImage src={booking.vehicle.image_url} alt="" sizes="80px" className="p-1" />
                    </span>
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 font-medium">
                        <CarFrontIcon className="size-4" /> {booking.vehicle.name}
                      </p>
                      <p className="text-muted-foreground">
                        {serviceTypeLabels[booking.service_type]} · {booking.days} {booking.days === 1 ? "day" : "days"} ·{" "}
                        {booking.destination ? `${booking.destination} (${zoneName(booking.destination_zone, booking.vehicle.branch)})` : zoneName(booking.destination_zone, booking.vehicle.branch)}
                      </p>
                    </div>
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl border p-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarIcon className="size-3.5" /> Pickup
                      </dt>
                      <dd className="mt-1 font-medium">{formatDateTime(booking.pickup_at)}</dd>
                      <dd className="text-muted-foreground">{locationName(booking.pickup_location)}</dd>
                      {booking.pickup_address && <dd className="font-medium">{booking.pickup_address}</dd>}
                    </div>
                    <div className="rounded-xl border p-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarIcon className="size-3.5" /> Return
                      </dt>
                      <dd className="mt-1 font-medium">{formatDateTime(booking.return_at)}</dd>
                      <dd className="text-muted-foreground">{locationName(booking.return_location)}</dd>
                      {booking.return_address && <dd className="font-medium">{booking.return_address}</dd>}
                    </div>
                  </dl>
                  {booking.delivery_address && <p className="rounded-xl bg-muted/50 p-3 text-sm">Deliver to: {booking.delivery_address}</p>}
                  {booking.notes && <p className="rounded-xl bg-muted/50 p-3 text-sm">Customer note: {booking.notes}</p>}
                </section>
              </div>

              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="font-sans text-sm font-semibold">Price</h3>
                  <div className="space-y-1.5 rounded-xl border p-4 text-sm">
                    <Row label={`Base (${peso(booking.daily_rate)} x ${booking.days})`} value={booking.base_amount} />
                    {booking.discount_amount > 0 && <Row label="Long rental discount" value={-booking.discount_amount} />}
                    {booking.driver_amount > 0 && <Row label="Driver" value={booking.driver_amount} />}
                    {booking.extras_amount > 0 && (
                      <Row
                        label={`Extras: ${booking.extras.map((c) => extrasNames?.find((e) => e.code === c)?.name ?? c).join(", ")}`}
                        value={booking.extras_amount}
                      />
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{peso(booking.total_amount)}</span>
                    </div>
                  </div>
                </section>

                <CustomerEmails
                  notifications={booking.notifications}
                  canResend={booking.status === "confirmed" || booking.status === "cancelled"}
                  resending={resend.isPending}
                  onResend={() => resend.mutate()}
                />

                <NotesEditor
                  key={`${booking.id}:${booking.admin_notes ?? ""}`}
                  initial={booking.admin_notes ?? ""}
                  saving={update.isPending}
                  onSave={(admin_notes) => update.mutate({ admin_notes })}
                />
              </div>
            </div>
            <CancelBookingDialog
              booking={confirmCancel ? booking : null}
              onClose={() => setConfirmCancel(false)}
              onConfirm={() => update.mutate({ status: "cancelled" }, { onSettled: () => setConfirmCancel(false) })}
              working={update.isPending}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

const EMAIL_STATUS: Record<BookingNotification["status"], { label: string; icon: typeof CheckIcon; className: string }> = {
  sent: { label: "Sent", icon: CheckIcon, className: "text-success" },
  failed: { label: "Failed", icon: XIcon, className: "text-destructive" },
  skipped: { label: "Not set up", icon: MailIcon, className: "text-muted-foreground" },
}

/** The automatic emails this booking sent its customer, newest first. */
function CustomerEmails({
  notifications,
  canResend,
  resending,
  onResend,
}: {
  notifications: BookingNotification[]
  canResend: boolean
  resending: boolean
  onResend: () => void
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-sans text-sm font-semibold">Customer emails</h3>
        {canResend && (
          <Button variant="outline" size="sm" disabled={resending} onClick={onResend}>
            {resending ? <Spinner /> : <MailIcon />} {notifications.length ? "Resend" : "Send email"}
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          The customer is emailed automatically when you confirm or cancel this booking.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border text-sm">
          {notifications.map((n) => {
            const status = EMAIL_STATUS[n.status]
            return (
              <li key={n.id} className="space-y-0.5 p-3">
                <p className="flex items-center justify-between gap-2">
                  <span className="font-medium">{n.event === "confirmed" ? "Confirmation" : "Cancellation"}</span>
                  <span className={cn("flex items-center gap-1 text-xs font-semibold", status.className)}>
                    <status.icon className="size-3.5" /> {status.label}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {n.recipient} · {formatDateTime(n.created_at)}
                </p>
                {n.error && <p className="text-xs text-muted-foreground">{n.error}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function NotesEditor({ initial, saving, onSave }: { initial: string; saving: boolean; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(initial)
  return (
    <section className="space-y-2">
      <h3 className="font-sans text-sm font-semibold">Internal notes</h3>
      <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment received, plate assigned, special instructions" />
      <Button variant="outline" size="sm" disabled={saving || notes === initial} onClick={() => onSave(notes)}>
        Save notes
      </Button>
    </section>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value < 0 ? `- ${peso(-value)}` : peso(value)}</span>
    </div>
  )
}
