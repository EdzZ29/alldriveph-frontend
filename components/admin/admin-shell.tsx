"use client"

import { MutationCache, QueryCache, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import {
  BadgePercentIcon,
  CalendarCheckIcon,
  CarFrontIcon,
  ExternalLinkIcon,
  HandshakeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MessageCircleIcon,
  NewspaperIcon,
  SparklesIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, use, useState } from "react"
import { toast } from "sonner"

import { LiveUpdates, NotificationBell } from "@/components/admin/live-updates"
import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths"
import { Logo } from "@/components/site/logo"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { chatUnreadQuery, prefetchAdminPage } from "@/lib/admin-queries"
import { branchShort } from "@/lib/branch-labels"
import { ApiError, call } from "@/lib/client-api"
import type { User } from "@/lib/types"

const UserContext = createContext<User | null>(null)

export function useAdminUser() {
  const user = use(UserContext)
  if (!user) throw new Error("useAdminUser must be used inside AdminShell")
  return user
}

/** Roomy sidebar entries; the collapsed icon rail keeps its own compact size. */
const MENU_BUTTON = "h-10 gap-3 rounded-lg px-3 text-[0.925rem] font-medium [&>svg]:size-[18px]"

/** Pages a branch owner may open: their branch's dashboard, bookings and fleet, plus their account. */
const OWNER_PAGES = ["/admin", "/admin/bookings", "/admin/fleet", "/admin/commissions", "/admin/account"]

const nav = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheckIcon },
      { href: "/admin/fleet", label: "Fleet", icon: CarFrontIcon },
      { href: "/admin/commissions", label: "Commissions", icon: BadgePercentIcon },
      { href: "/admin/chats", label: "Chats", icon: MessageCircleIcon },
      { href: "/admin/messages", label: "Messages", icon: MailIcon },
    ],
  },
  {
    label: "Website content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: NewspaperIcon },
      { href: "/admin/services", label: "Services", icon: SparklesIcon },
      { href: "/admin/partners", label: "Partners", icon: HandshakeIcon },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircleIcon },
    ],
  },
]

/** Open chats with visitor messages nobody has read yet; the live stream keeps it current. */
function UnreadChatsBadge() {
  const { data } = useQuery(chatUnreadQuery())
  if (!data?.conversations) return null
  return <SidebarMenuBadge className="top-2.5! right-2 rounded-full bg-destructive text-white!">{data.conversations}</SidebarMenuBadge>
}

function makeQueryClient() {
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      // full reload on purpose: clears every cached query from the expired session
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/admin/logout?next=${encodeURIComponent(window.location.pathname)}`
    }
  }
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({
      onError: (error) => {
        onError(error)
        toast.error(error instanceof ApiError ? error.message : "Something went wrong")
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2 },
    },
  })
}

export function AdminShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  // start loading a page's data as soon as its link is pointed at, focused or touched
  const preload = (href: string) => {
    const start = () => prefetchAdminPage(queryClient, href)
    return { onMouseEnter: start, onFocus: start, onTouchStart: start }
  }
  const pathname = usePathname()

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))
  const isOwner = user.role === "owner"
  const menu = isOwner
    ? nav.map((g) => ({ ...g, items: g.items.filter((i) => OWNER_PAGES.includes(i.href)) })).filter((g) => g.items.length)
    : nav
  const pageAllowed = !isOwner || OWNER_PAGES.some((p) => (p === "/admin" ? pathname === "/admin" : pathname.startsWith(p)))
  const initials = user.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const signOut = async () => {
    try {
      await call("logout")
    } finally {
       
      window.location.href = ADMIN_LOGIN_PATH
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext value={user}>
        <LiveUpdates user={user}>
          <SidebarProvider>
            <Sidebar collapsible="icon" variant="inset">
              <SidebarHeader className="px-4 py-5">
                <Logo href="/admin" className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
              </SidebarHeader>
              <SidebarContent>
                {menu.map((group) => (
                  <SidebarGroup key={group.label} className="px-3 py-2">
                    <SidebarGroupLabel className="mb-1 px-3 text-xs font-semibold tracking-wide uppercase">{group.label}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-1">
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild className={MENU_BUTTON} isActive={isActive(item.href)} tooltip={item.label}>
                              <Link href={item.href} {...preload(item.href)}>
                                <item.icon />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                            {item.href === "/admin/chats" && <UnreadChatsBadge />}
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ))}
                {user.role === "admin" && (
                  <SidebarGroup className="px-3 py-2">
                    <SidebarGroupLabel className="mb-1 px-3 text-xs font-semibold tracking-wide uppercase">Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-1">
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className={MENU_BUTTON} isActive={isActive("/admin/users")} tooltip="Team">
                            <Link href="/admin/users" {...preload("/admin/users")}>
                              <UsersIcon />
                              <span>Team</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </SidebarContent>
              <SidebarFooter className="px-3 pb-4">
                <SidebarMenu className="gap-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={MENU_BUTTON} tooltip="View website">
                      <Link href="/" target="_blank">
                        <ExternalLinkIcon />
                        <span>View website</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>

            <SidebarInset>
              <header className="sticky top-0 z-20 flex h-14 items-center gap-2 rounded-t-xl border-b bg-background/85 px-4 backdrop-blur">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  {nav.flatMap((g) => g.items).find((i) => isActive(i.href))?.label ??
                    (pathname.startsWith("/admin/users") ? "Team" : pathname.startsWith("/admin/account") ? "Account" : "Admin")}
                </p>
                <div className="ml-auto flex items-center gap-1">
                  <NotificationBell />
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-brand-strong">{initials}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                        {isOwner && user.branch && (
                          <p className="mt-1 text-xs font-medium text-brand-strong">{branchShort[user.branch]} branch owner</p>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/account">
                          <UserCogIcon /> Account settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut} variant="destructive">
                        <LogOutIcon /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                {pageAllowed ? (
                  children
                ) : (
                  <Empty className="rounded-2xl border border-dashed py-16">
                    <EmptyHeader>
                      <EmptyTitle>This page is not part of your account</EmptyTitle>
                      <EmptyDescription>Branch owner accounts manage their branch&apos;s dashboard, bookings, fleet and commissions.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button asChild>
                        <Link href="/admin/bookings">Go to bookings</Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </LiveUpdates>
      </UserContext>
    </QueryClientProvider>
  )
}
