import { FadeUp, HeroCars, HeroHeadline } from "@/components/home/hero-motion"
import { getI18n } from "@/lib/i18n/server"

export async function Hero() {
  const { t } = await getI18n()
  const h = t.home.hero
  return (
    <section className="relative overflow-hidden bg-ink pb-28 text-ink-foreground">
      <div className="hero-glow animate-drift pointer-events-none absolute inset-0" aria-hidden />
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-page relative pt-10 text-center sm:pt-16">
        <FadeUp delay={0.08}>
          <p className="text-xs font-semibold tracking-[0.35em] text-ink-muted uppercase sm:text-sm">{h.eyebrow}</p>
        </FadeUp>

        <div className="mt-5">
          <HeroHeadline lines={[{ text: h.headline.line1 }, { text: h.headline.line2, accent: true }]} />
        </div>

        <FadeUp delay={0.55} className="mx-auto mt-7 max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
            {h.body}
          </p>
        </FadeUp>

      </div>

      <div className="relative mt-6 px-4 sm:-mt-10">
        <HeroCars alts={h.carAlts} />
      </div>
    </section>
  )
}
