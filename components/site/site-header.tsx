"use client"

import { ArrowUpRightIcon, BadgePercentIcon, ChevronDownIcon, MenuIcon, SearchCheckIcon } from "lucide-react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { EASE_OUT } from "@/components/motion/reveal"
import { channelText, chatChannels, contactChannels } from "@/components/site/contact-channels"
import { Logo } from "@/components/site/logo"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { stripLocale } from "@/lib/i18n/config"
import { mainNav } from "@/lib/site"
import { cn } from "@/lib/utils"

/** The chat apps we answer on, shown one after another in the "Chat with us" button. */
function CyclingChatIcon() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % chatChannels.length), 2200)
    return () => clearInterval(timer)
  }, [reduceMotion])
  const channel = chatChannels[reduceMotion ? 0 : index]
  return (
    <span className="relative size-4 shrink-0" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.span
          key={channel.key}
          className="absolute inset-0"
          style={{ color: channel.color }}
          initial={{ opacity: 0, y: 8, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.6 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <channel.icon className="size-4" />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function AnnouncementBar() {
  const { t } = useI18n()
  return (
    <div className="bg-ink px-3 pt-3">
      <Link
        href="/rates"
        className="group mx-auto flex max-w-7xl items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground transition-[filter] hover:brightness-105 sm:text-sm"
      >
        <BadgePercentIcon className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">{t.nav.announcement.strong}</strong>
          <span className="hidden sm:inline"> {t.nav.announcement.rest}</span>
        </span>
        <ArrowUpRightIcon className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  )
}

export function SiteHeader() {
  return <SiteHeaderView pathname={usePathname()} />
}

/** Rendered as the Suspense fallback on routes where the pathname is only known at request time. */
export function SiteHeaderView({ pathname }: { pathname: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  // shrink after leaving the top; tuck away while scrolling down, return on scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    setHidden(y > 480 && y > previous + 4 && !open)
    if (y < previous - 4) setHidden(false)
  })

  const path = stripLocale(pathname)
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`)
  const links = [...mainNav.map((item) => ({ href: item.href, label: t.nav.links[item.key] }))]
  const mobileLinks = [...links, { href: "/faq", label: t.nav.links.faq }, { href: "/track", label: t.nav.links.track }]

  return (
    <motion.header
      className="sticky top-0 z-50 bg-ink px-3 py-3"
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-3 rounded-full border border-white/10 bg-ink pr-2 pl-4 text-ink-foreground transition-all duration-500 sm:pl-5",
          scrolled ? "h-14 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]" : "h-16"
        )}
      >
        {/* very narrow phones show just the mark so the controls fit */}
        <Logo tone="light" className="max-[400px]:[&>span:last-child]:hidden" />

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((item) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={cn(
                  "relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) ? "text-white" : "text-ink-muted hover:text-white"
                )}
              >
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-ink-muted outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary md:flex">
              <CyclingChatIcon />
              {t.nav.chat.button}
              <ChevronDownIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t.nav.chat.hint}</DropdownMenuLabel>
              {chatChannels.map((channel) => (
                <DropdownMenuItem key={channel.key} asChild>
                  <a href={channel.href} {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <span className="grid size-7 place-items-center rounded-full" style={{ backgroundColor: `${channel.color}1f`, color: channel.color }}>
                      <channel.icon className="size-3.5" />
                    </span>
                    {channel.label}
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/track">
                  <SearchCheckIcon /> {t.nav.chat.track}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* reads the query string, so it streams in on its own */}
          <Suspense fallback={<span className="w-14" />}>
            <LanguageSwitcher />
          </Suspense>

          {/* on phones the theme toggle lives in the menu so the bar never overflows */}
          <ThemeToggle className="text-ink-muted hover:bg-white/10 hover:text-white max-sm:hidden" label={t.nav.menu.toggleTheme} />

          <Button asChild className="h-9 rounded-full px-3 font-semibold whitespace-nowrap shadow-[0_8px_24px_-8px] shadow-primary/60 sm:h-10 sm:px-4">
            <Link href="/fleet">
              {t.nav.bookNow} <ArrowUpRightIcon className="max-sm:hidden" />
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label={t.nav.menu.open}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm border-white/10 bg-ink text-ink-foreground">
              <SheetHeader>
                <SheetTitle className="sr-only">{t.nav.menu.title}</SheetTitle>
                <Logo tone="light" />
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {mobileLinks.map((item, i) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, ease: EASE_OUT }}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-3 py-3 font-heading text-xl font-semibold text-ink-muted transition-colors hover:bg-white/5 hover:text-white",
                        isActive(item.href) && "bg-white/10 text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mx-4 mt-auto flex items-center justify-between rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium sm:hidden">
                {t.nav.menu.toggleTheme}
                <ThemeToggle className="text-ink-muted hover:bg-white/10 hover:text-white" label={t.nav.menu.toggleTheme} />
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 sm:mt-auto">
                {contactChannels.slice(0, 4).map((channel) => (
                  <a
                    key={channel.key}
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium hover:bg-white/5"
                  >
                    <span style={{ color: channel.color === "#27abff" ? undefined : channel.color }}>
                      <channel.icon className="size-4" />
                    </span>
                    {channelText(t, channel).label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}
