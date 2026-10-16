import { CN, ES, JP, KR, PH, US } from "country-flag-icons/react/1x1"

import { cn } from "@/lib/utils"

// Only the flags the language picker uses, so the rest of the set stays out of the bundle.
const FLAGS = { CN, ES, JP, KR, PH, US } as const

/** A round country flag, e.g. <Flag code="PH" />. Decorative: the language name sits next to it. */
export function Flag({ code, className }: { code: string; className?: string }) {
  const Svg = FLAGS[code as keyof typeof FLAGS]
  if (!Svg) return null
  return (
    <span className={cn("inline-block size-6 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10", className)} aria-hidden>
      <Svg className="block size-full" />
    </span>
  )
}
