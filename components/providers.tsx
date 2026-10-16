"use client"

import { MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {/* honours the visitor's "reduce motion" setting across every animation */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
