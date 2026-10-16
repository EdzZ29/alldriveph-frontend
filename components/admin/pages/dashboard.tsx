"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRightIcon, CalendarCheckIcon, CarFrontIcon, ClockIcon, MailIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useAdminUser } from "@/components/admin/admin-shell"
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-ui"
import { branchShort } from "@/lib/branch-labels"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { statsQuery } from "@/lib/admin-queries"
import { formatDateTime, peso } from "@/lib/format"

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "short" })
}

export function Dashboard() {
  const user = useAdminUser()
  const { data, isPending } = useQuery({
    ...statsQuery(),
    refetchInterval: 60_000,
  })

  const stats = [
    { label: "Revenue this month", value: data ? peso(data.revenue_month) : null, icon: WalletIcon, hint: "Confirmed and completed trips" },
    { label: "New bookings", value: data?.bookings_month, icon: CalendarCheckIcon, hint: "Received this month" },
    { label: "Awaiting confirmation", value: data?.pending, icon: ClockIcon, hint: "Pending bookings", href: "/admin/bookings?status=pending" },
    {
      label: "Cars on the road",
      value: data ? `${data.on_road} / ${data.active_fleet}` : null,
      icon: CarFrontIcon,
      hint: data ? `${data.utilization}% utilization` : "",
    },
  ]

  return (
    <>
      <AdminPageHeader
        title={`Good day, ${user.full_name.split(" ")[0]}`}
        description={
          user.role === "owner" && user.branch
            ? `Here is what is happening at the ${branchShort[user.branch]} branch.`
            : "Here is what is happening with your rentals."
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/bookings">
              View bookings <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint, href }) => {
          const body = (
            <Card className="h-full gap-3 transition-colors hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardDescription>{label}</CardDescription>
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-brand-strong">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                {value === null || value === undefined ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          )
          return href ? (
            <Link key={label} href={href}>
              {body}
            </Link>
          ) : (
            <div key={label}>{body}</div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Revenue, last 6 months</CardTitle>
            <CardDescription>Confirmed, ongoing and completed bookings by pickup month</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={data?.monthly ?? []} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={monthLabel} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent labelFormatter={(l) => monthLabel(String(l))} formatter={(v) => peso(Number(v))} />}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="font-sans text-base">Upcoming pickups</CardTitle>
              <CardDescription>Next confirmed and pending trips</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.upcoming.length ? (
              <ul className="divide-y">
                {data.upcoming.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings?open=${b.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted/60">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {b.customer_name} <span className="text-muted-foreground">· {b.vehicle.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(b.pickup_at)}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No upcoming pickups.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {data && data.unread_messages > 0 && (
        <Link
          href="/admin/messages"
          className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm hover:bg-primary/10"
        >
          <MailIcon className="size-4 text-brand-strong" />
          <span>
            You have <strong>{data.unread_messages}</strong> unread {data.unread_messages === 1 ? "message" : "messages"}.
          </span>
          <ArrowRightIcon className="ml-auto size-4" />
        </Link>
      )}
    </>
  )
}
