"use client"

import { CheckIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { Flag } from "@/components/i18n/flag"
import { useI18n } from "@/components/i18n/provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALE_COOKIE, htmlLang, localeNames, localizePath, locales, stripLocale, type Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

/** Remembers the choice for a year so the proxy sends returning visitors to their language. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

/** Switches language while staying on the same page, and remembers the choice. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [pending, startTransition] = useTransition()

  const choose = (next: Locale) => {
    if (next === lang) return
    rememberLocale(next)
    const query = search.toString()
    const target = localizePath(next, stripLocale(pathname)) + (query ? `?${query}` : "")
    startTransition(() => router.push(target, { scroll: false }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.nav.language.choose}
        className={cn(
          "flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold text-ink-muted outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary",
          pending && "opacity-60",
          className
        )}
      >
        <Flag code={localeNames[lang].flag} className="size-5" />
        {localeNames[lang].short}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(30rem,calc(100vw-2rem))] p-3">
        <DropdownMenuLabel className="px-2 pb-3 text-base font-semibold text-foreground">{t.nav.language.choose}</DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {locales.map((locale) => {
            const name = localeNames[locale]
            const active = locale === lang
            return (
              <DropdownMenuItem
                key={locale}
                onClick={() => choose(locale)}
                lang={htmlLang[locale]}
                className={cn("gap-3 rounded-lg px-2.5 py-2.5 text-sm", active && "bg-accent font-semibold")}
              >
                <Flag code={name.flag} />
                <span className="flex-1">
                  {name.label} <span className="text-muted-foreground">({name.region})</span>
                </span>
                {active && <CheckIcon className="text-brand-strong" />}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
