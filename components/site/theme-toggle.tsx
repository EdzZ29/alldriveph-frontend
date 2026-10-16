"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className, label = "Toggle dark mode" }: { className?: string; label?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn("rounded-full", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden transition-transform duration-500 hover:rotate-45 dark:block" />
      <MoonIcon className="transition-transform duration-500 hover:-rotate-12 dark:hidden" />
    </Button>
  )
}
