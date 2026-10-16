import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

/** Dark band that continues the navigation on inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("relative overflow-hidden bg-ink pb-20 text-ink-foreground sm:pb-24", className)}>
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-page relative pt-12 sm:pt-16">
        <Reveal className="max-w-3xl space-y-5">
          {eyebrow && <Eyebrow tone="light">{eyebrow}</Eyebrow>}
          <h1 className="font-heading text-4xl leading-[1.02] font-extrabold tracking-tighter text-white sm:text-6xl">{title}</h1>
          {description && <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{description}</p>}
        </Reveal>
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}

export function Eyebrow({
  children,
  index,
  tone = "dark",
  className,
}: {
  children: React.ReactNode
  index?: string
  tone?: "dark" | "light"
  className?: string
}) {
  return (
    <p className={cn("flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase", tone === "light" ? "text-primary" : "text-brand-strong", className)}>
      {index ? (
        <span className={cn("grid size-7 place-items-center rounded-full text-[0.65rem] tracking-normal", tone === "light" ? "bg-white text-ink" : "bg-ink text-ink-foreground")}>
          {index}
        </span>
      ) : (
        <span className="h-px w-8 bg-current" />
      )}
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string
  index?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: "left" | "center"
  className?: string
  action?: React.ReactNode
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn("max-w-2xl space-y-4", align === "center" && "mx-auto flex flex-col items-center")}>
        {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <h2 className="font-heading text-4xl leading-[1.02] font-extrabold tracking-tighter sm:text-5xl">{title}</h2>
        {description && <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
      </div>
      {action}
    </Reveal>
  )
}
