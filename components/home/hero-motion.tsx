"use client"

import { motion } from "motion/react"
import Image from "next/image"

import { EASE_OUT } from "@/components/motion/reveal"

/** Headline whose words rise into view one after another. */
export function HeroHeadline({ lines }: { lines: { text: string; accent?: boolean }[] }) {
  let index = 0
  return (
    <h1 className="font-heading text-[3.4rem] leading-[0.92] font-extrabold tracking-tighter text-white sm:text-7xl lg:text-[6.5rem]">
      {lines.map((line) => (
        <span key={line.text} className={line.accent ? "text-gradient block pb-2" : "block"}>
          {line.text.split(" ").map((word) => {
            const delay = 0.15 + index++ * 0.08
            return (
              <span key={word} className="inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className="inline-block pr-[0.22em]"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease: EASE_OUT, delay }}
                >
                  {word}
                </motion.span>
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

export function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

const cars = [
  { src: "/images/cars/toyota-commuter-deluxe-2023-mt.png", alt: "commuter" as const, w: 1023, h: 465, className: "left-[-6%] bottom-[6%] w-[42%] z-10", from: -120, delay: 0.55 },
  { src: "/images/cars/toyota-avanza.png", alt: "avanza" as const, w: 792, h: 432, className: "right-[-4%] bottom-[5%] w-[38%] z-10", from: 120, delay: 0.65 },
  { src: "/images/cars/toyota-hilux.avif", alt: "hilux" as const, w: 664, h: 415, className: "left-1/2 bottom-0 w-[46%] -translate-x-1/2 z-20", from: 0, delay: 0.4 },
]

/** The fleet lineup that drives into the hero. */
export function HeroCars({ alts }: { alts: Record<"commuter" | "avanza" | "hilux", string> }) {
  return (
    <div className="relative mx-auto aspect-[16/6] w-full max-w-6xl">
      {/* floor glow and light streak */}
      <div className="absolute inset-x-[8%] bottom-[2%] h-[18%] rounded-[100%] bg-primary/25 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 bottom-[3%] h-px overflow-hidden" aria-hidden>
        <div className="road-streak h-px w-full" />
      </div>
      {cars.map((car) => (
        <motion.div
          key={car.src}
          className={`absolute ${car.className}`}
          initial={{ opacity: 0, x: car.from, y: car.from === 0 ? 40 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: car.delay }}
        >
          <Image
            src={car.src}
            alt={alts[car.alt]}
            width={car.w}
            height={car.h}
            priority
            sizes="(min-width: 1024px) 40vw, 60vw"
            className="h-auto w-full drop-shadow-[0_30px_30px_rgba(0,0,0,0.55)]"
          />
        </motion.div>
      ))}
    </div>
  )
}
