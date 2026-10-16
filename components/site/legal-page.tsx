import { headingId, Markdown } from "@/components/site/markdown"
import Link from "@/components/i18n/link"
import { PageHeader } from "@/components/site/page-header"
import { formatDate } from "@/lib/format"
import { fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function LegalPage({
  title,
  description,
  updated,
  content,
}: {
  title: string
  description: string
  updated: string
  content: string
}) {
  const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1])
  const { t, lang } = await getI18n()
  const l = t.legal

  return (
    <>
      <PageHeader eyebrow={l.eyebrow} title={title} description={description} />
      <section className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[240px_1fr]">
        <nav aria-label={l.onThisPage} className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l.onThisPage}</p>
            <ul className="space-y-1 border-l">
              {headings.map((heading) => (
                <li key={heading}>
                  <a href={`#${headingId(heading)}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="max-w-3xl">
          {lang !== "en" && l.notice.title && (
            <aside className="mb-8 rounded-2xl border border-primary/30 bg-primary/10 p-5">
              <p className="font-semibold">{l.notice.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.notice.body}</p>
              <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-brand-strong underline underline-offset-4">
                {l.notice.cta}
              </Link>
            </aside>
          )}
          <p className="mb-8 inline-flex rounded-full border px-3 py-1 text-sm text-muted-foreground">{fmt(l.lastUpdated, { date: formatDate(updated, lang) })}</p>
          <Markdown className="[&_h2]:scroll-mt-24">{content}</Markdown>
        </div>
      </section>
    </>
  )
}
