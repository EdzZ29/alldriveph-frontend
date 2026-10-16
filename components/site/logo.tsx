import Image from "next/image"
import Link from "@/components/i18n/link"

import { cn } from "@/lib/utils"

export function LogoMark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={1394}
      height={978}
      priority={priority}
      sizes="48px"
      className={cn("h-8 w-auto shrink-0", className)}
    />
  )
}

/** Brand lockup. `tone="light"` is for dark backgrounds such as the navigation and footer. */
export function Logo({
  className,
  href = "/",
  tone = "dark",
}: {
  className?: string
  href?: string
  tone?: "dark" | "light"
}) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)} aria-label="Alldrive Rent a Car PH home">
      <LogoMark priority className="transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-[1.05rem] font-extrabold tracking-tight", tone === "light" ? "text-white" : "text-foreground")}>
          ALLDRIVE
        </span>
        <span className={cn("mt-1 text-[0.55rem] font-semibold tracking-[0.22em] whitespace-nowrap uppercase", tone === "light" ? "text-ink-muted" : "text-muted-foreground")}>
          Rent a car PH
        </span>
      </span>
    </Link>
  )
}
