"use client"

import { CookieIcon } from "lucide-react"
import Link from "@/components/i18n/link"
import { useI18n } from "@/components/i18n/provider"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export const CONSENT_KEY = "adp_cookie_consent"

export type ConsentChoice = "all" | "essential"

function readConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    return value === "all" || value === "essential" ? value : null
  } catch {
    return null
  }
}

export function CookieConsent() {
  const { t } = useI18n()
  const c = t.nav.cookie
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Delay slightly so the banner never competes with the first paint
    const timer = setTimeout(() => setVisible(readConsent() === null), 800)
    return () => clearTimeout(timer)
  }, [])

  const choose = (choice: ConsentChoice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice)
      document.cookie = `${CONSENT_KEY}=${choice}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`
    } catch {
      // storage can be blocked in private mode; the banner simply hides for this visit
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={c.dialog}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 rounded-2xl border bg-popover/95 p-4 shadow-xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-brand-strong">
          <CookieIcon className="size-4.5" />
        </span>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {c.text}{" "}
            <Link href="/cookies-policy" className="font-medium text-foreground underline underline-offset-4">
              {c.policy}
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="px-4" onClick={() => choose("all")}>
              {c.acceptAll}
            </Button>
            <Button size="lg" variant="outline" className="px-4" onClick={() => choose("essential")}>
              {c.essential}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
