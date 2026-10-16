"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BadgePercentIcon, CalendarIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, UndoIcon, WalletIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useAdminUser } from "@/components/admin/admin-shell"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { commissionSummaryQuery, commissionsQuery, type CommissionFilters } from "@/lib/admin-queries"
import { call } from "@/lib/client-api"
import { formatDateTime, formatShortDate, peso } from "@/lib/format"
import type { BranchCode, Commission } from "@/lib/types"

const BRANCH_NAMES: Record<BranchCode, string> = { butuan: "Butuan", "cagayan-de-oro": "Cagayan de Oro", davao: "Davao" }

/** What the payment dialog is recording: one commission, or everything a branch owes. */
type Payment = { kind: "one"; commission: Commission } | { kind: "branch"; branch: BranchCode; amount: number; count: number }

export function CommissionsManager() {
  const user = useAdminUser()
  const queryClient = useQueryClient()
  const isAdmin = user.role === "admin"
  const ownBranch = user.role === "owner" ? user.branch : null
  const [filters, setFilters] = useState<CommissionFilters>({ status: "all", branch: null, page: 1 })
  const [paying, setPaying] = useState<Payment | null>(null)

  const summary = useQuery(commissionSummaryQuery(ownBranch ? null : filters.branch))
  const list = useQuery({ ...commissionsQuery(filters), placeholderData: keepPreviousData })
  const rate = Math.round((summary.data?.rate ?? 0.1) * 100)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/admin/commissions"] })
  const markUnpaid = useMutation({
    mutationFn: (id: string) => call("update_commissions", { ids: [id], status: "unpaid" }),
    onSuccess: () => {
      toast.success("Marked as unpaid")
      void refresh()
    },
  })

  return (
    <>
      <AdminPageHeader
        title={ownBranch ? `${BRANCH_NAMES[ownBranch]} commissions` : "Commissions"}
        description={
          ownBranch
            ? `Your branch pays Alldrive ${rate}% of every completed booking. Each one is listed here, with what is still unpaid.`
            : `Branch owners pay Alldrive ${rate}% of every completed booking. Record their payments here.`
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={ClockIcon}
          label={ownBranch ? "You owe" : "Unpaid"}
          value={summary.data ? peso(summary.data.unpaid_amount) : null}
          hint={summary.data ? `${summary.data.unpaid_count} completed ${summary.data.unpaid_count === 1 ? "booking" : "bookings"}` : ""}
          tone="warning"
        />
        <SummaryCard
          icon={CheckCircle2Icon}
          label="Paid"
          value={summary.data ? peso(summary.data.paid_amount) : null}
          hint={summary.data ? `${summary.data.paid_count} ${summary.data.paid_count === 1 ? "booking" : "bookings"}` : ""}
          tone="success"
        />
        <SummaryCard
          icon={CalendarIcon}
          label="This month"
          value={summary.data ? peso(summary.data.month_amount) : null}
          hint="Commission earned this month"
        />
        <SummaryCard icon={BadgePercentIcon} label="Rate" value={`${rate}%`} hint="Of each completed booking total" />
      </div>

      {!ownBranch && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-sans text-base">By branch</CardTitle>
            <CardDescription>What each branch owner owes{isAdmin ? ". Record a payment when they settle up." : "."}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Branch</TableHead>
                  <TableHead className="text-right">Unpaid</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Paid</TableHead>
                  <TableHead className="hidden text-right md:table-cell">This month</TableHead>
                  {isAdmin && <TableHead className="pr-6 text-right">Payment</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary.data?.branches ?? []).map((b) => (
                  <TableRow key={b.branch}>
                    <TableCell className="pl-6 font-medium">{BRANCH_NAMES[b.branch] ?? b.branch}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={b.unpaid_amount ? "font-semibold text-warning" : "text-muted-foreground"}>{peso(b.unpaid_amount)}</span>
                      <span className="block text-xs text-muted-foreground">{b.unpaid_count} unpaid</span>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{peso(b.paid_amount)}</TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">{peso(b.month_amount)}</TableCell>
                    {isAdmin && (
                      <TableCell className="pr-6 text-right">
                        <Button
                          size="sm"
                          disabled={!b.unpaid_count}
                          onClick={() => setPaying({ kind: "branch", branch: b.branch, amount: b.unpaid_amount, count: b.unpaid_count })}
                        >
                          <WalletIcon /> Record payment
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v as CommissionFilters["status"], page: 1 }))}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>
        {!ownBranch && (
          <Select value={filters.branch ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, branch: v === "all" ? null : v, page: 1 }))}>
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
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {list.isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !list.data?.items.length ? (
          <Empty className="py-14">
            <EmptyHeader>
              <EmptyTitle>No commissions yet</EmptyTitle>
              <EmptyDescription>A commission is added the moment a booking is marked as returned (completed).</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking no.</TableHead>
                <TableHead className="hidden md:table-cell">Customer · Car</TableHead>
                {!ownBranch && <TableHead className="hidden lg:table-cell">Branch</TableHead>}
                <TableHead className="hidden sm:table-cell">Completed</TableHead>
                <TableHead className="text-right">Booking total</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Payment</TableHead>
                {isAdmin && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs font-semibold">{c.booking.reference}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="font-medium">{c.booking.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.booking.vehicle_name} · {c.booking.days} {c.booking.days === 1 ? "day" : "days"}
                    </p>
                  </TableCell>
                  {!ownBranch && <TableCell className="hidden lg:table-cell">{BRANCH_NAMES[c.branch] ?? c.branch}</TableCell>}
                  <TableCell className="hidden text-sm sm:table-cell">{formatShortDate(c.created_at)}</TableCell>
                  <TableCell className="text-right tabular-nums">{peso(c.booking_total)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {peso(c.amount)}
                    <span className="block text-xs font-normal text-muted-foreground">{Math.round(c.rate * 100)}%</span>
                  </TableCell>
                  <TableCell>
                    {c.status === "paid" ? (
                      <div>
                        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                          Paid
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.paid_at ? formatDateTime(c.paid_at) : ""}
                          {c.payment_note ? ` · ${c.payment_note}` : ""}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                        Unpaid
                      </Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {c.status === "unpaid" ? (
                        <Button size="sm" variant="outline" onClick={() => setPaying({ kind: "one", commission: c })}>
                          <WalletIcon /> Mark paid
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={markUnpaid.isPending} onClick={() => markUnpaid.mutate(c.id)}>
                          <UndoIcon /> Undo
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {list.data && list.data.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {list.data.total} commissions · page {list.data.page} of {list.data.pages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                <ChevronLeftIcon /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= list.data.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isAdmin && <PaymentDialog payment={paying} onClose={() => setPaying(null)} onDone={refresh} />}
    </>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof ClockIcon
  label: string
  value: string | null
  hint: string
  tone?: "warning" | "success"
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-brand-strong">
            <Icon className="size-4" />
          </span>
        </div>
        {value === null ? (
          <Skeleton className="mt-3 h-8 w-28" />
        ) : (
          <p className={`mt-2 font-heading text-2xl font-bold tabular-nums ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : ""}`}>
            {value}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

/** Admin only: records that a branch owner paid, with an optional note such as a GCash reference. */
function PaymentDialog({ payment, onClose, onDone }: { payment: Payment | null; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState("")
  const save = useMutation({
    mutationFn: () =>
      payment?.kind === "branch"
        ? call<{ updated: number }>("settle_branch_commissions", { branch: payment.branch, payment_note: note.trim() || null })
        : call<{ updated: number }>("update_commissions", {
            ids: payment ? [payment.commission.id] : [],
            status: "paid",
            payment_note: note.trim() || null,
          }),
    onSuccess: (result) => {
      toast.success(`Payment recorded for ${result.updated} ${result.updated === 1 ? "commission" : "commissions"}`)
      setNote("")
      onDone()
      onClose()
    },
  })
  if (!payment) return null
  const title =
    payment.kind === "branch"
      ? `Record ${BRANCH_NAMES[payment.branch]} payment`
      : `Mark ${payment.commission.booking.reference} as paid`
  const amount = payment.kind === "branch" ? payment.amount : payment.commission.amount
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {payment.kind === "branch"
              ? `Marks all ${payment.count} unpaid ${payment.count === 1 ? "commission" : "commissions"} (${peso(amount)}) as paid.`
              : `Marks this ${peso(amount)} commission as paid.`}{" "}
            The branch owner sees it on their commissions page right away.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="payment-note">Payment note (optional)</FieldLabel>
          <Input id="payment-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="GCash ref 1234 5678" />
          <FieldDescription>How it was paid, for example a GCash or bank reference.</FieldDescription>
        </Field>
        <DialogFooter>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner />} Record {peso(amount)} payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
