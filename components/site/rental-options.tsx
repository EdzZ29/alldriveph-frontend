import { ArrowRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "@/components/i18n/link"

import { Stagger, StaggerItem } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"

const options = [
  { key: "selfDrive" as const, image: "/images/cars/toyota-vios-black.png", href: "/fleet?service=self_drive" },
  { key: "withDriver" as const, image: "/images/cars/toyota-innova-white.png", href: "/fleet?service=with_driver" },
  { key: "tours" as const, image: "/images/cars/toyota-gl-gradia-at-2023.png", href: "/fleet?category=van&service=with_driver" },
]

export async function RentalOptions({ className }: { className?: string }) {
  const { t } = await getI18n()
  const items = options.map((o) => ({ ...o, ...t.home.rentalOptions[o.key] }))
  return (
    <Stagger className={cn("grid gap-5 md:grid-cols-3", className)} gap={0.12}>
      {items.map((option) => (
        <StaggerItem key={option.title} className="h-full">
        <article
          className="group flex h-full flex-col items-center rounded-[2rem] border bg-card px-6 pt-4 pb-8 text-center shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_28px_56px_-28px_rgba(15,23,42,0.4)]"
        >
          <div className="relative aspect-[16/10] w-full max-w-72">
            <Image
              src={option.image}
              alt=""
              fill
              sizes="(min-width: 768px) 30vw, 80vw"
              className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 dark:mix-blend-normal dark:rounded-2xl dark:bg-slate-100 dark:p-3"
            />
          </div>
          <h3 className="mt-3 font-heading text-2xl font-extrabold tracking-tight">{option.title}</h3>
          <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">{option.text}</p>
          <p className="mt-3 mb-6 text-xs font-semibold tracking-wider text-brand-strong uppercase">{option.from}</p>
          <Button asChild size="xl" className="mt-auto translate-y-3 rounded-full px-6 font-semibold shadow-[0_10px_24px_-10px] shadow-primary/70">
            <Link href={option.href}>
              {t.nav.bookNow} <ArrowRightIcon />
            </Link>
          </Button>
        </article>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
