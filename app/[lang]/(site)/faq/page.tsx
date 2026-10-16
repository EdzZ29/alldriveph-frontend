import { MessageCircleQuestionIcon, PhoneIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { PageHeader } from "@/components/site/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { JsonLd } from "@/lib/seo"
import { site } from "@/lib/site"
import type { Faq } from "@/lib/types"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.faq.meta.title, description: t.faq.meta.description, alternates: alternatesFor(lang, "/faq") }
}

async function FaqList() {
  const { t } = await getI18n()
  const result = await safeLoad(api.faqs)
  if (result.error) return <ApiErrorState />

  const groups = result.data.reduce<Record<string, Faq[]>>((acc, faq) => {
    ;(acc[faq.category] ??= []).push(faq)
    return acc
  }, {})

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: result.data.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <JsonLd data={jsonLd} />
      <nav aria-label={t.faq.categoriesLabel} className="hidden lg:block">
        <ul className="sticky top-24 space-y-1">
          {Object.keys(groups).map((category) => (
            <li key={category}>
              <a href={`#${category.toLowerCase().replace(/\s+/g, "-")}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                {category}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-10">
        {Object.entries(groups).map(([category, faqs]) => (
          <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold">{category}</h2>
            <Accordion type="multiple" className="rounded-2xl border bg-card px-5">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="py-5 text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  )
}

export default async function FaqPage() {
  const { t } = await getI18n()
  const f = t.faq
  return (
    <>
      <PageHeader
        eyebrow={f.header.eyebrow}
        title={f.header.title}
        description={f.header.description}
      />
      <section className="container-page py-14 sm:py-20">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <FaqList />
        </Suspense>
        <div className="mt-16 flex flex-col items-start gap-5 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand-strong">
            <MessageCircleQuestionIcon className="size-5.5" />
          </span>
          <div className="flex-1">
            <h2 className="font-sans text-lg font-semibold">{f.still.title}</h2>
            <p className="text-muted-foreground">{f.still.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={site.phoneHref}>
                <PhoneIcon /> {f.still.call}
              </a>
            </Button>
            <Button asChild>
              <Link href="/contact">{f.still.message}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
