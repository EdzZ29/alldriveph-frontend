"use client"

import { animate, motion, useInView, useReducedMotion, type Variants } from "motion/react"
import { useEffect, useRef, useState } from "react"

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: "div" | "section" | "li" | "article"
}) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </Component>
  )
}

const container: Variants = {
  hidden: {},
  show: (gap: number) => ({ transition: { staggerChildren: gap, delayChildren: 0.05 } }),
}

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Staggers the entrance of its StaggerItem children. */
export function Stagger({ children, className, gap = 0.08 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div className={className} variants={container} custom={gap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}

/** Counts up to a number when it scrolls into view. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      const timer = setTimeout(() => setDisplay(value), 0)
      return () => clearTimeout(timer)
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString("en-PH")}
      {suffix}
    </span>
  )
}
