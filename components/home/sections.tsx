import { ArrowRightIcon, CalendarClockIcon, ClockIcon, ExternalLinkIcon } from "lucide-react"
import Image from "next/image"
import Link from "@/components/i18n/link"

import { FleetShowcase } from "@/components/fleet/fleet-showcase"
import { RatesExplorer } from "@/components/rates/rates-explorer"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { ServiceIcon } from "@/components/site/icons"
import { TripSearch } from "@/components/site/trip-search"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api } from "@/lib/api"
import { isOptimizable } from "@/lib/images"
import { formatDate, peso } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"

export async function HeroSearch() {
  const { data } = await safeLoad(api.meta)
  return <TripSearch locations={data?.locations ?? []} className="border-0 bg-muted/50 p-3 shadow-none sm:p-4 dark:bg-muted/30" />
}

export async function FleetSection() {
  const [vehicles, meta] = await Promise.all([safeLoad(() => api.vehicles({ sort: "recommended" })), safeLoad(api.meta)])
  if (vehicles.error || meta.error) return <ApiErrorState title={(await getI18n()).t.home.fleet.loadError} />
  return <FleetShowcase vehicles={vehicles.data} zones={meta.data.zones} branches={meta.data.branches} limit={8} />
}

export async function RatesPreview() {
  const [vehicles, meta] = await Promise.all([safeLoad(() => api.vehicles()), safeLoad(api.meta)])
  if (vehicles.error || meta.error) return <ApiErrorState title={(await getI18n()).t.home.rates.loadError} />
  return <RatesExplorer vehicles={vehicles.data} meta={meta.data} />
}

export async function ServicesPreview() {
  const { t } = await getI18n()
  const result = await safeLoad(api.services)
  if (result.error) return <ApiErrorState />
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.slice(0, 6).map((service) => (
        <Link
          key={service.id}
          href={`/services#${service.slug}`}
          className="group rounded-[1.75rem] border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)]"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-ink text-primary transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-primary group-hover:text-primary-foreground">
            <ServiceIcon name={service.icon} className="size-5" />
          </span>
          <h3 className="mt-6 font-heading text-xl font-bold tracking-tight">{service.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
          <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-strong">
            {service.price_from ? `${t.common.units.from} ${peso(service.price_from)}` : t.home.services.customQuote}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </p>
        </Link>
      ))}
    </div>
  )
}

export async function PartnersStrip() {
  const result = await safeLoad(api.partners)
  if (result.error || result.data.length === 0) return null
  // repeat a short list so one half of the marquee is wider than any screen, then duplicate it
  // so the loop is seamless
  const half = Array.from({ length: Math.ceil(8 / result.data.length) }, () => result.data).flat()
  const loop = [...half, ...half]
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <ul className="animate-marquee flex w-max gap-3 group-hover:[animation-play-state:paused]">
        {loop.map((partner, i) => (
          <li
            key={`${partner.id}-${i}`}
            aria-hidden={i >= result.data.length || undefined}
            className="flex h-20 w-72 shrink-0 items-center gap-3 rounded-2xl border bg-card px-3"
            title={partner.description}
          >
            {(partner.logo_url || partner.image_url) && (
              <span className={cn("relative size-14 shrink-0 overflow-hidden rounded-xl", partner.logo_url && "border bg-white")}>
                <Image
                  src={(partner.logo_url || partner.image_url)!}
                  alt=""
                  fill
                  sizes="56px"
                  unoptimized={!isOptimizable((partner.logo_url || partner.image_url)!)}
                  className={partner.logo_url ? "object-contain p-1" : "object-cover"}
                />
              </span>
            )}
            <span className="min-w-0 text-left">
              <span className="line-clamp-2 font-heading text-sm leading-tight font-bold text-foreground/85">{partner.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{partner.category}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function FaqPreview() {
  const result = await safeLoad(api.faqs)
  if (result.error) return <ApiErrorState />
  return (
    <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
      {result.data.slice(0, 5).map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="py-5 text-base">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export async function LatestPosts() {
  const result = await safeLoad(() => api.posts(1, 3))
  if (result.error) return <ApiErrorState />
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {result.data.items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export async function PostCard({ post }: { post: import("@/lib/types").BlogPostSummary }) {
  const { t, lang } = await getI18n()
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/30">
      <div className="car-panel aspect-[16/9]">
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            unoptimized={post.cover_image_url.startsWith("/media/")}
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-strong">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg leading-snug font-semibold">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <p className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <CalendarClockIcon className="size-3.5" /> {formatDate(post.published_at, lang)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5" /> {fmt(t.common.units.minRead, { count: post.reading_minutes })}
          </span>
        </p>
      </div>
    </article>
  )
}

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-strong hover:underline">
      {children} <ExternalLinkIcon className="size-3.5" />
    </a>
  )
}
