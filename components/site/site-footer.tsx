import { ClockIcon, MapPinIcon, NavigationIcon, PhoneIcon } from "lucide-react"
import { cacheLife } from "next/cache"
import Link from "@/components/i18n/link"

import { channelText, chatChannels, contactChannels } from "@/components/site/contact-channels"
import { Logo } from "@/components/site/logo"
import { branches, upcomingBranches } from "@/lib/branches"
import { fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { site } from "@/lib/site"


async function CopyrightYear() {
  "use cache"
  cacheLife("days")
  return <>{new Date().getFullYear()}</>
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-sans text-[0.7rem] font-semibold tracking-[0.22em] text-ink-muted uppercase">{children}</h3>
}

export async function SiteFooter() {
  const { t } = await getI18n()
  const f = t.nav.footer
  const explore = [
    { href: "/fleet", label: t.nav.links.fleet },
    { href: "/rates", label: t.nav.links.rates },
    { href: "/services", label: t.nav.links.services },
    { href: "/partners", label: f.exploreLinks.partners },
    { href: "/affiliate", label: f.exploreLinks.affiliate },
    { href: "/blog", label: t.nav.links.blog },
    { href: "/faq", label: t.nav.links.faq },
    { href: "/track", label: f.exploreLinks.track },
    { href: "/contact", label: t.nav.links.contact },
  ]
  const areas = [
    { href: "/car-rental/butuan", label: f.areas.butuan },
    { href: "/rates#zones", label: f.areas.caraga },
    { href: "/car-rental/cagayan-de-oro", label: f.areas.cdo },
    { href: "/car-rental/davao", label: f.areas.davao },
    { href: "/rates#zones", label: f.areas.mindanao },
  ]
  const legal = [
    { href: "/terms", label: f.legal.terms },
    { href: "/privacy-policy", label: f.legal.privacy },
    { href: "/cookies-policy", label: f.legal.cookies },
  ]

  return (
    <footer className="mt-auto bg-background pt-20 sm:pt-28">
      <div className="rounded-t-[2.5rem] bg-ink text-ink-foreground">
        <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.7fr_1fr]">
          <div className="space-y-5">
            <Logo tone="light" />
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{f.description}</p>
            <a href={site.directionsHref} target="_blank" rel="noopener noreferrer" className="flex max-w-xs gap-2 text-sm text-ink-muted hover:text-white">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              {site.address}
            </a>
            <a href={site.directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <NavigationIcon className="size-3.5" /> {f.getDirections}
            </a>
            <div className="flex flex-wrap gap-2 pt-1">
              {contactChannels
                .filter((c) => c.key !== "call" && c.key !== "directions")
                .map((channel) => (
                  <a
                    key={channel.key}
                    href={channel.href}
                    aria-label={channelText(t, channel).label}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group grid size-10 place-items-center rounded-full border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-[var(--brand-hover)]"
                    style={{ color: channel.color, ["--brand-hover" as string]: channel.color }}
                  >
                    <channel.icon className="size-4 transition-colors group-hover:text-white" />
                  </a>
                ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Heading>{f.callUs}</Heading>
              <ul className="space-y-3">
                {site.phones.map((phone) => (
                  <li key={phone.number}>
                    <a href={phone.href} className="group flex items-center gap-2.5 font-heading text-lg font-semibold text-white">
                      <PhoneIcon className="size-4 text-primary transition-transform group-hover:-rotate-12" />
                      {phone.number}
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-sans text-[0.6rem] font-semibold tracking-wider text-ink-muted uppercase">
                        {phone.network}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <Heading>{f.messageUs}</Heading>
              <ul className="space-y-2.5">
                {chatChannels.map((channel) => (
                  <li key={channel.key}>
                    <a
                      href={channel.href}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-center gap-2.5 font-medium text-white/90 hover:text-white"
                    >
                      <span style={{ color: channel.color }}>
                        <channel.icon className="size-4" />
                      </span>
                      {fmt(t.nav.chat.chatOn, { name: channel.label })}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <ClockIcon className="size-4 text-primary" /> {f.hours}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Heading>{f.explore}</Heading>
            <ul className="space-y-2.5">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/85 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
          <div className="space-y-4">
            <Heading>{f.ourBranches}</Heading>
            <ul className="space-y-3">
              {branches.map((branch) => (
                <li key={branch.slug}>
                  <Link href={`/car-rental/${branch.slug}`} className="group flex gap-2.5">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block font-semibold text-white transition-colors group-hover:text-primary">
                        {fmt(f.branchName, { city: branch.slug === "cagayan-de-oro" ? "CDO" : branch.shortCity })}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {fmt(f.branchLine, { city: branch.city, code: branch.airport.code })}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              {upcomingBranches.map((branch) => (
                <li key={branch.slug} className="flex gap-2.5">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                  <span>
                    <span className="block font-semibold text-white/80">{fmt(f.branchName, { city: branch.shortCity })}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-primary uppercase">{t.common.badges.soon}</span>
                      {branch.city}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <Heading>{f.areasWeServe}</Heading>
            <ul className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <li key={area.label}>
                  <Link
                    href={area.href}
                    className="block rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:border-primary hover:text-primary"
                  >
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; <CopyrightYear /> {site.name}. {f.rights}
            </p>
            <ul className="flex gap-5">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
