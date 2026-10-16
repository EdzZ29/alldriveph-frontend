import { ArrowUpRightIcon } from "lucide-react"
import Link from "@/components/i18n/link"

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { channelText, contactChannels } from "@/components/site/contact-channels"
import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"

export async function CtaBanner() {
  const { t } = await getI18n()
  const c = t.home.cta
  return (
    <section className="px-3 pt-20 sm:pt-28">
      <div className="relative mx-auto max-w-[96rem] overflow-hidden rounded-[2.5rem] bg-primary text-primary-foreground">
        {/* soft concentric rings for depth */}
        <div className="pointer-events-none absolute -right-40 -bottom-48 size-[34rem] rounded-full border-[3rem] border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-white/15 blur-3xl" aria-hidden />

        <div className="container-page relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase opacity-70">{c.eyebrow}</p>
            <h2 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-tighter sm:text-7xl">
              {c.titleLine1}
              <br />
              {c.titleLine2}
            </h2>
            <p className="max-w-md text-lg opacity-80">{c.body}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="xl" className="rounded-full bg-ink text-ink-foreground hover:bg-ink/90">
                <Link href="/fleet">
                  {c.quote} <ArrowUpRightIcon />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-full border-ink/25 bg-transparent text-primary-foreground hover:bg-white/20 dark:border-ink/25 dark:bg-transparent">
                <Link href="/contact">{c.message}</Link>
              </Button>
            </div>
          </Reveal>

          <Stagger className="grid gap-3" gap={0.07}>
            {contactChannels
              .filter((c) => c.key !== "call")
              .map((channel) => (
                <StaggerItem key={channel.key}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-2xl bg-white/90 p-3 pr-5 text-slate-900 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_32px_-16px_rgba(15,23,42,0.55)]"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                      style={{ backgroundColor: channel.color }}
                    >
                      <channel.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-slate-500">{channelText(t, channel).label}</span>
                      <span className="block truncate font-semibold">{channelText(t, channel).value}</span>
                    </span>
                    <ArrowUpRightIcon className="size-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900" />
                  </a>
                </StaggerItem>
              ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
