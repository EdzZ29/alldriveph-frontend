import { ArrowLeftIcon, CalendarCheckIcon, CarFrontIcon, LayoutTemplateIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { LoginForm } from "@/components/admin/login-form"
import { Logo } from "@/components/site/logo"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Sign in", robots: { index: false } }

const features = [
  { icon: CalendarCheckIcon, title: "Bookings", text: "Confirm, track and close every rental." },
  { icon: CarFrontIcon, title: "Fleet and rates", text: "Cars, zone rates and availability per branch." },
  { icon: LayoutTemplateIcon, title: "Website content", text: "Blog, FAQ, services and partners." },
]

const branches = ["Butuan", "Cagayan de Oro", "Davao"]

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col">
        <div className="hero-glow animate-drift pointer-events-none absolute inset-0" aria-hidden />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        <div className="relative flex flex-1 flex-col justify-between gap-10 p-10 xl:p-14">
          <Logo href="/" tone="light" />

          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              <span className="h-px w-8 bg-current" /> Admin console
            </p>
            <h2 className="max-w-md font-heading text-5xl leading-[0.95] font-extrabold tracking-tighter text-white xl:text-6xl">
              Every trip, <span className="text-gradient">one dashboard.</span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-ink-muted">
              Run bookings, the fleet and the website for all Alldrive branches across Mindanao.
            </p>
          </div>

          <div className="relative mx-auto aspect-[16/8] w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out motion-reduce:animate-none delay-150">
            <div className="absolute inset-x-[8%] bottom-[6%] h-6 rounded-[50%] bg-black/50 blur-xl" aria-hidden />
            <Image
              src="/images/cars/toyota-hilux.avif"
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 32rem, 40vw"
              className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.45)]"
            />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out motion-reduce:animate-none delay-300">
            <ul className="grid gap-3 xl:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{text}</p>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              {branches.map((b) => (
                <span key={b} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1">
                  <MapPinIcon className="size-3 text-primary" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Right: sign in */}
      <main className="relative flex flex-col overflow-hidden bg-background">
        <div className="bg-brand-wash pointer-events-none absolute inset-0" aria-hidden />
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" aria-hidden />

        <div className="relative flex items-center justify-between p-6 sm:p-8">
          <Logo href="/" className="lg:invisible" />
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" /> Back to website
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-16 sm:px-8">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out motion-reduce:animate-none delay-100">
            <div className="mb-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-brand-strong">
                <ShieldCheckIcon className="size-3.5" /> Staff only
              </span>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">Sign in with your staff account to manage Alldrive.</p>
            </div>
            <Suspense fallback={<Skeleton className="h-80 rounded-[1.75rem]" />}>
              <LoginForm />
            </Suspense>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Forgot your password? Ask an admin to reset it from the Users page.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
