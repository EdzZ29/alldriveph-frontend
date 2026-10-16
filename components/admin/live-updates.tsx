"use client"

// Real time updates for the admin panel. One live stream (GET /api/v1/events, Server-Sent Events)
// tells the panel about new bookings, contact messages and chat messages the moment they happen:
// lists and dashboard figures refresh themselves, a toast pops up, and the bell keeps a short
// history. Branch owners only hear about bookings at their branch (the API filters the stream).

import { useQueryClient } from "@tanstack/react-query"
import { BadgePercentIcon, BellIcon, CalendarCheckIcon, CheckCheckIcon, MailIcon, MessageCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { peso } from "@/lib/format"
import type { BookingNotice, ChatMessage, CommissionNotice, ContactNotice, User } from "@/lib/types"
import { cn } from "@/lib/utils"

type Kind = "booking" | "contact" | "chat" | "commission"

export interface Notice {
  id: string
  kind: Kind
  title: string
  body: string
  href: string
  at: string
  read: boolean
  /** chat: how many messages this notification stands for */
  count?: number
}

const MAX_NOTICES = 40
const ICONS = { booking: CalendarCheckIcon, contact: MailIcon, chat: MessageCircleIcon, commission: BadgePercentIcon } satisfies Record<Kind, unknown>

interface LiveState {
  notices: Notice[]
  unread: number
  markAllRead: () => void
  markRead: (id: string) => void
  /** false while the stream is reconnecting */
  connected: boolean
}

const LiveContext = createContext<LiveState | null>(null)

export function useLive() {
  const value = use(LiveContext)
  if (!value) throw new Error("useLive must be used inside LiveUpdates")
  return value
}

function loadNotices(key: string): Notice[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Notice[]) : []
  } catch {
    return []
  }
}

function saveNotices(key: string, notices: Notice[]) {
  try {
    localStorage.setItem(key, JSON.stringify(notices))
  } catch {
    // private mode or storage full: the bell still works for this visit
  }
}

const NO_NOTICES: Notice[] = []

/** The bell's history for one user, kept in this browser and shared by every component. */
function noticeStore(key: string) {
  let notices = loadNotices(key)
  const listeners = new Set<() => void>()
  return {
    get: () => notices,
    update(change: (current: Notice[]) => Notice[]) {
      const next = change(notices)
      if (next === notices) return
      notices = next
      saveNotices(key, next)
      listeners.forEach((listener) => listener())
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function LiveUpdates({ user, children }: { user: User; children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const storageKey = `adp_notices_${user.id}`
  const store = useMemo(() => noticeStore(storageKey), [storageKey])
  // the server render has no browser storage, so it starts empty and fills in after hydration
  const notices = useSyncExternalStore(store.subscribe, store.get, () => NO_NOTICES)
  const [connected, setConnected] = useState(true)

  // the chat open on screen right now, so its own messages do not pop up as toasts
  const viewing = useRef<string | null>(null)
  const openChat = pathname.startsWith("/admin/chats") ? search.get("open") : null
  useEffect(() => {
    viewing.current = openChat
    // opening a chat answers its notification
    if (openChat) store.update((current) => current.map((n) => (n.id === `chat:${openChat}` && !n.read ? { ...n, read: true } : n)))
  }, [openChat, store])

  const push = useCallback(
    (notice: Omit<Notice, "at" | "read">) => {
      store.update((current) =>
        current.some((n) => n.id === notice.id)
          ? current
          : [{ ...notice, at: new Date().toISOString(), read: false }, ...current].slice(0, MAX_NOTICES)
      )
      const Icon = ICONS[notice.kind]
      toast(notice.title, {
        description: notice.body,
        icon: <Icon className="size-4" />,
        action: { label: "Open", onClick: () => router.push(notice.href) },
      })
    },
    [store, router]
  )

  /**
   * One notification per visitor conversation: further messages update it ("3 new chat
   * messages", latest text) instead of adding more, and only the first one pops up. Once it has
   * been read, the visitor's next message notifies again.
   */
  const pushChat = useCallback(
    (message: ChatMessage) => {
      const id = `chat:${message.conversation_id}`
      const body = message.body.length > 120 ? `${message.body.slice(0, 117)}…` : message.body
      const waiting = store.get().find((n) => n.id === id && !n.read)
      if (!waiting) {
        store.update((current) => current.filter((n) => n.id !== id))
        push({ id, kind: "chat", title: "New chat message", body, href: `/admin/chats?open=${message.conversation_id}`, count: 1 })
        return
      }
      store.update((current) => {
        const count = (waiting.count ?? 1) + 1
        const updated = { ...waiting, body, count, title: `${count} new chat messages`, at: new Date().toISOString() }
        return [updated, ...current.filter((n) => n.id !== id)]
      })
    },
    [store, push]
  )

  useEffect(() => {
    const source = new EventSource("/api/v1/events")
    let opened = false

    source.onopen = () => {
      setConnected(true)
      // after a reconnect, catch up on anything missed while the stream was down
      if (opened) void queryClient.invalidateQueries()
      opened = true
    }
    source.onerror = () => setConnected(false)

    source.addEventListener("booking", (e) => {
      const booking = JSON.parse((e as MessageEvent).data) as BookingNotice
      void queryClient.invalidateQueries({ queryKey: ["/admin/bookings"] })
      void queryClient.invalidateQueries({ queryKey: ["/admin/stats"] })
      if (booking.change === "created") {
        push({
          id: `booking:${booking.id}`,
          kind: "booking",
          title: `New booking ${booking.reference}`,
          body: `${booking.customer_name} · ${booking.vehicle_name}`,
          href: `/admin/bookings?open=${booking.id}`,
        })
      }
    })

    // commissions: earned when a booking is completed, then paid by the branch owner
    source.addEventListener("commission", (e) => {
      const commission = JSON.parse((e as MessageEvent).data) as CommissionNotice
      void queryClient.invalidateQueries({ queryKey: ["/admin/commissions"] })
      if (commission.change === "unpaid") return
      const owner = user.role === "owner"
      const due = commission.change === "created"
      push({
        id: `commission:${commission.id}:${commission.change}`,
        kind: "commission",
        title: due
          ? owner
            ? `Commission due: ${peso(commission.amount)}`
            : `Commission earned: ${peso(commission.amount)}`
          : `Commission paid: ${peso(commission.amount)}`,
        body: due ? `Booking ${commission.reference} was completed.` : `Payment recorded for ${commission.reference}.`,
        href: "/admin/commissions",
      })
    })

    source.addEventListener("contact", (e) => {
      const contact = JSON.parse((e as MessageEvent).data) as ContactNotice
      void queryClient.invalidateQueries({ queryKey: ["/admin/messages"] })
      void queryClient.invalidateQueries({ queryKey: ["/admin/stats"] })
      push({
        id: `contact:${contact.id}`,
        kind: "contact",
        title: `New message from ${contact.name}`,
        body: contact.subject,
        href: "/admin/messages",
      })
    })

    source.addEventListener("message", (e) => {
      const message = JSON.parse((e as MessageEvent).data) as ChatMessage
      void queryClient.invalidateQueries({ queryKey: ["/admin/chat", message.conversation_id] })
      if (message.sender === "visitor" && viewing.current !== message.conversation_id) pushChat(message)
    })

    source.addEventListener("conversation", () => {
      void queryClient.invalidateQueries({ queryKey: ["/admin/chats"] })
      void queryClient.invalidateQueries({ queryKey: ["/admin/chat-unread"] })
    })

    return () => source.close()
  }, [queryClient, push, pushChat, user.role])

  const value = useMemo<LiveState>(
    () => ({
      notices,
      unread: notices.filter((n) => !n.read).length,
      connected,
      markAllRead: () => store.update((current) => current.map((n) => ({ ...n, read: true }))),
      markRead: (id) => store.update((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n))),
    }),
    [notices, connected, store]
  )

  return <LiveContext value={value}>{children}</LiveContext>
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

/** The bell in the admin header: unread count, recent notifications, and the live status. */
export function NotificationBell() {
  const { notices, unread, markAllRead, markRead, connected } = useLive()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={unread ? `${unread} new notifications` : "Notifications"}>
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[0.65rem] leading-4.5 font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", connected ? "bg-success" : "bg-warning")} />
            {connected ? "Live" : "Reconnecting…"}
          </span>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto">
          {notices.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">New bookings, messages and chats will appear here.</p>
          ) : (
            notices.map((notice) => {
              const Icon = ICONS[notice.kind]
              return (
                <Link
                  key={notice.id}
                  href={notice.href}
                  onClick={() => markRead(notice.id)}
                  className={cn("flex gap-3 border-b px-3 py-3 text-sm transition-colors last:border-0 hover:bg-accent", !notice.read && "bg-primary/5")}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-brand-strong">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate", !notice.read && "font-semibold")}>{notice.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(notice.at)}</span>
                    </span>
                    <span className="line-clamp-2 text-muted-foreground">{notice.body}</span>
                  </span>
                </Link>
              )
            })
          )}
        </div>
        {unread > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <button type="button" onClick={markAllRead} className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-accent">
              <CheckCheckIcon className="size-4" /> Mark all as read
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
