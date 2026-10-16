import {
  ArrowDownIcon,
  BadgePercentIcon,
  CarFrontIcon,
  ChartNoAxesColumnIncreasingIcon,
  HandshakeIcon,
  HeadsetIcon,
  LinkIcon,
  MegaphoneIcon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "@/components/i18n/link"

import { AffiliateSignup } from "@/components/affiliate/affiliate-signup"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/site/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { faqSchema, JsonLd } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.affiliate.meta.title, description: t.affiliate.meta.description, alternates: alternatesFor(lang, "/affiliate") }
}

const benefitIcons = [WalletIcon, CarFrontIcon, ChartNoAxesColumnIncreasingIcon, HeadsetIcon]

const stepIcons = [UserPlusIcon, LinkIcon, BadgePercentIcon]

const cities = [
  "Butuan City",
  "Cagayan de Oro",
  "Davao City",
  "Surigao City",
  "Iligan City",
  "General Santos City",
  "Zamboanga City",
  "Bislig City",
  "Tandag City",
  "Malaybalay City",
  "Valencia City",
  "Tagum City",
  "Mati City",
  "Dipolog City",
  "Pagadian City",
  "Cotabato City",
  "Koronadal City",
  "Ozamiz City",
]


export default async function AffiliatePage() {
  const { t } = await getI18n()
  const a = t.affiliate
  const benefits = a.benefits.items.map((item, i) => ({ ...item, icon: benefitIcons[i] }))
  const steps = a.how.steps.map((item, i) => ({ ...item, icon: stepIcons[i] }))
  const faqs = a.faqs
  const home = t.home.hero
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        {/* angled brand panel, echoing the affiliate reference */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] bg-primary [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)] lg:block" aria-hidden />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1fr]">
          <Reveal className="space-y-6">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              <span className="h-px w-8 bg-current" /> {a.hero.eyebrow}
            </p>
            <h1 className="font-heading text-4xl leading-[1.02] font-extrabold tracking-tighter text-white sm:text-6xl">
              {a.hero.title}
              <span className="text-gradient block">{a.hero.titleAccent}</span>
            </h1>
            <p className="max-w-xl text-lg text-ink-muted italic">
              {a.hero.body}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="xl" className="h-12 rounded-full px-8 text-base font-semibold shadow-[0_12px_32px_-10px] shadow-primary/70">
                <Link href="#signup">
                  {a.hero.signUp} <ArrowDownIcon />
                </Link>
              </Button>
              <span className="text-xl text-white italic">{a.hero.free}</span>
            </div>
            <p className="max-w-md text-xs text-ink-muted">
              <span className="text-primary">*</span> {a.hero.note}
            </p>
          </Reveal>

          {/* laptop mockup of the Alldrive site */}
          <Reveal delay={0.15} className="relative mx-auto w-full max-w-xl">
            <div className="rounded-t-2xl border-[10px] border-b-0 border-slate-800 bg-slate-800 shadow-2xl">
              <div className="overflow-hidden rounded-t-lg bg-ink">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="size-2 rounded-full bg-green-400" />
                  <span className="ml-3 rounded-full bg-white/10 px-3 py-0.5 text-[0.6rem] text-ink-muted">alldriveph.com/?ref=YOURCODE</span>
                </div>
                <div className="hero-glow relative px-6 pt-6 pb-2 text-center">
                  <p className="text-[0.5rem] font-semibold tracking-[0.3em] text-ink-muted uppercase">{home.eyebrow}</p>
                  <p className="mt-2 font-heading text-2xl leading-none font-extrabold tracking-tighter text-white">{home.headline.line1}</p>
                  <p className="text-gradient font-heading text-2xl leading-tight font-extrabold tracking-tighter">{home.headline.line2}</p>
                  <div className="relative mx-auto mt-3 aspect-[16/7] w-4/5">
                    <Image src="/images/cars/toyota-hilux.avif" alt="" fill sizes="300px" className="object-contain drop-shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-3 rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400" />
            <div className="mx-auto h-1.5 w-1/3 rounded-b-xl bg-slate-400" />
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-page py-20 sm:py-28">
        <SectionHeading index="01" eyebrow={a.benefits.eyebrow} title={a.benefits.title} description={a.benefits.description} />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          {benefits.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-[1.75rem] border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)]">
                <span className="grid size-12 place-items-center rounded-2xl bg-ink text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 font-heading text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground sm:py-28">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-page relative">
          <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              <span className="grid size-7 place-items-center rounded-full bg-white text-[0.65rem] tracking-normal text-ink">02</span> {a.how.eyebrow}
            </p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-white sm:text-5xl">{a.how.title}</h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 md:grid-cols-3" gap={0.12}>
            {steps.map(({ icon: Icon, title, text }, i) => (
              <StaggerItem key={title}>
                <div className="relative h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-7">
                  <span className="absolute top-6 right-7 font-heading text-6xl font-extrabold text-white/[0.06]">0{i + 1}</span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-bold text-white">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Who can join + cities */}
      <section className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-2">
        <Reveal className="space-y-6">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-brand-strong uppercase">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.65rem] tracking-normal text-ink-foreground">03</span> {a.who.eyebrow}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tighter sm:text-5xl">{a.who.title}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {a.who.audiences.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm font-medium">
                <HandshakeIcon className="size-4 shrink-0 text-brand-strong" /> {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="rounded-[1.75rem] bg-muted/50 p-7">
          <div className="flex items-center gap-3">
            <MegaphoneIcon className="size-5 text-brand-strong" />
            <h3 className="font-heading text-xl font-bold">{a.who.citiesTitle}</h3>
          </div>
          <p className="mt-2 text-muted-foreground">{a.who.citiesBody}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city} className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/10">
                {city}
              </li>
            ))}
            <li className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ink-foreground">{a.who.andMore}</li>
          </ul>
        </Reveal>
      </section>

      {/* Sign up */}
      <section id="signup" className="scroll-mt-28 bg-muted/40 py-20 sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal className="space-y-5 lg:sticky lg:top-32">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-brand-strong uppercase">
              <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.65rem] tracking-normal text-ink-foreground">04</span> {a.signup.eyebrow}
            </p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tighter sm:text-5xl">{a.signup.title}</h2>
            <p className="text-lg text-muted-foreground">{a.signup.body}</p>
            <Accordion type="single" collapsible className="rounded-[1.5rem] border bg-card px-5">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="py-4 text-base">{faq.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
          <Reveal delay={0.1}>
            <AffiliateSignup />
          </Reveal>
        </div>
      </section>
    </>
  )
}
