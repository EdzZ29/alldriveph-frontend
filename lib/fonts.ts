import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" })
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" })

/** Class names that expose the font CSS variables; applied to <html> by both root layouts. */
export const fontVariables = `${inter.variable} ${display.variable} ${jetbrains.variable}`
