// The data each admin page loads, in one place, so the sidebar can start loading a page's data
// when a link is hovered or focused. By the time the click lands the data is usually cached and
// the page renders complete instead of showing skeletons.
import { queryOptions, type QueryClient } from "@tanstack/react-query"

import { call } from "@/lib/client-api"
import type {
  AdminStats,
  BlogPostAdmin,
  BookingAdmin,
  ChatConversation,
  ChatMessage,
  Commission,
  CommissionSummary,
  ContactMessage,
  Faq,
  Meta,
  Page,
  Partner,
  Service,
  User,
  Vehicle,
  VehicleAdmin,
} from "@/lib/types"

// ---------- dashboard ----------

export const statsQuery = () =>
  queryOptions({
    queryKey: ["/admin/stats"],
    queryFn: () => call<AdminStats>("stats"),
  })

// ---------- bookings ----------

/** What a row of the bookings table shows. */
export type BookingRow = Pick<
  BookingAdmin,
  | "id"
  | "reference"
  | "status"
  | "service_type"
  | "customer_name"
  | "customer_email"
  | "customer_phone"
  | "pickup_location"
  | "return_location"
  | "pickup_at"
  | "return_at"
  | "days"
  | "total_amount"
  | "created_at"
> & { vehicle: Pick<Vehicle, "name"> }

export type BookingsMeta = Pick<Meta, "locations" | "zones"> & { extras: Pick<Meta["extras"][number], "code" | "name">[] }

export type BookingFilters = { page: number; status: string | null; q: string | null; branch: string | null }

export const bookingsQuery = (variables: BookingFilters) =>
  queryOptions({
    queryKey: ["/admin/bookings", variables],
    queryFn: () => call<Page<BookingRow>>("bookings", { ...variables, page_size: 15 }),
  })

export const bookingsMetaQuery = () =>
  queryOptions({
    queryKey: ["/meta", "bookings"],
    queryFn: () => call<BookingsMeta>("meta"),
    staleTime: Infinity,
  })

// ---------- messages ----------

export const messagesQuery = (filter: "all" | "unread", page: number) =>
  queryOptions({
    queryKey: ["/admin/messages", filter, page],
    queryFn: () => call<Page<ContactMessage>>("messages", { page, page_size: 20, unread: filter === "unread" }),
  })

// ---------- commissions ----------

export type CommissionFilters = { status: "unpaid" | "paid" | "all"; branch: string | null; page: number }

export const commissionsQuery = (filters: CommissionFilters) =>
  queryOptions({
    queryKey: ["/admin/commissions", "list", filters],
    queryFn: () => call<Page<Commission>>("commissions", { ...filters, page_size: 25 }),
  })

export const commissionSummaryQuery = (branch: string | null) =>
  queryOptions({
    queryKey: ["/admin/commissions", "summary", branch],
    queryFn: () => call<CommissionSummary>("commission_summary", { branch }),
  })

// ---------- website chat ----------

export type ChatFilter = "open" | "closed" | "all"

export const chatsQuery = (status: ChatFilter) =>
  queryOptions({
    queryKey: ["/admin/chats", status],
    queryFn: () => call<Page<ChatConversation>>("chats", { status }),
  })

/** One conversation; loading it marks it read, so the live stream keeps it fresh instead of polling. */
export const chatQuery = (id: string) =>
  queryOptions({
    queryKey: ["/admin/chat", id],
    queryFn: () => call<{ conversation: ChatConversation; messages: ChatMessage[] }>("chat", { id }),
  })

export const chatUnreadQuery = () =>
  queryOptions({
    queryKey: ["/admin/chat-unread"],
    queryFn: () => call<{ conversations: number }>("chat_unread"),
  })

// ---------- team ----------

export const usersQuery = () =>
  queryOptions({
    queryKey: ["/admin/users"],
    queryFn: () => call<User[]>("users"),
  })

// ---------- content managers ----------

/** How a content type is listed and saved through the API. */
export interface Resource<T> {
  key: string
  list: () => Promise<T[]>
  create: (input: Record<string, unknown>) => Promise<unknown>
  update: (id: string, input: Record<string, unknown>) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

/**
 * An admin content type whose operations follow the API's naming: create_<name>({ input }),
 * update_<name>({ id, input }) and delete_<name>({ id }). `list` loads every row, hidden ones included.
 */
export function resource<T>(name: string, list: () => Promise<T[]>): Resource<T> {
  return {
    key: name,
    list,
    create: (input) => call(`create_${name}`, { input }),
    update: (id, input) => call(`update_${name}`, { id, input }),
    remove: (id) => call(`delete_${name}`, { id }),
  }
}

export const resourceQuery = <T,>(res: Resource<T>) =>
  queryOptions({
    queryKey: ["admin", res.key],
    queryFn: res.list,
  })

export const resources = {
  vehicles: resource("vehicle", () => call<VehicleAdmin[]>("vehicles", { include_inactive: true, sort: "display_order" })),
  posts: resource("post", async () => (await call<Page<BlogPostAdmin>>("posts", { include_drafts: true, page_size: 1000 })).items),
  services: resource("service", () => call<Service[]>("services", { include_inactive: true })),
  partners: resource("partner", () => call<Partner[]>("partners", { include_inactive: true })),
  faqs: resource("faq", () => call<Faq[]>("faqs", { include_inactive: true })),
}

// ---------- sidebar prefetch ----------

/** What each admin page shows first, keyed by its path. */
const PAGE_QUERIES: Record<string, () => { queryKey: readonly unknown[] }[]> = {
  "/admin": () => [statsQuery()],
  "/admin/bookings": () => [bookingsQuery({ page: 1, status: null, q: null, branch: null }), bookingsMetaQuery()],
  "/admin/messages": () => [messagesQuery("all", 1)],
  "/admin/chats": () => [chatsQuery("open")],
  "/admin/commissions": () => [commissionSummaryQuery(null), commissionsQuery({ status: "all", branch: null, page: 1 })],
  "/admin/fleet": () => [resourceQuery(resources.vehicles)],
  "/admin/blog": () => [resourceQuery(resources.posts)],
  "/admin/services": () => [resourceQuery(resources.services)],
  "/admin/partners": () => [resourceQuery(resources.partners)],
  "/admin/faqs": () => [resourceQuery(resources.faqs)],
  "/admin/users": () => [usersQuery()],
}

/** Starts loading a page's data; does nothing when it is already cached and fresh. */
export function prefetchAdminPage(queryClient: QueryClient, href: string) {
  for (const options of PAGE_QUERIES[href]?.() ?? []) {
    void queryClient.prefetchQuery(options as Parameters<QueryClient["prefetchQuery"]>[0])
  }
}
