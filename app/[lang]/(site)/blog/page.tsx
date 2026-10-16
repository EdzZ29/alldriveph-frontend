import { NewspaperIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/i18n/link"
import { Suspense } from "react"

import { PostCard } from "@/components/home/sections"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { PageHeader } from "@/components/site/page-header"
import { CardGridSkeleton } from "@/components/site/skeletons"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { api } from "@/lib/api"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.blog.meta.title, description: t.blog.meta.description, alternates: alternatesFor(lang, "/blog") }
}

async function PostList({ searchParams }: { searchParams: PageProps<"/[lang]/blog">["searchParams"] }) {
  const search = await searchParams
  const { t } = await getI18n()
  const b = t.blog
  const page = Math.max(1, Number(search.page) || 1)
  const tag = typeof search.tag === "string" ? search.tag : undefined
  const result = await safeLoad(() => api.posts(page, 9, tag))
  if (result.error) return <ApiErrorState />
  const { items, pages } = result.data

  if (items.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NewspaperIcon />
          </EmptyMedia>
          <EmptyTitle>{b.empty.title}</EmptyTitle>
          <EmptyDescription>{b.empty.body}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const href = (p: number) => `/blog?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(p) })}`

  return (
    <>
      {tag && (
        <p className="mb-6 text-sm text-muted-foreground">
          {b.taggedWith.split("{tag}")[0]}
          <strong className="text-foreground">{tag}</strong>
          {b.taggedWith.split("{tag}")[1]}{" "}
          <Link href="/blog" className="font-medium text-brand-strong hover:underline">
            {t.common.actions.showAll}
          </Link>
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label={b.pagination.label} className="mt-12 flex items-center justify-center gap-3">
          <Button asChild variant="outline" disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
            <Link href={href(page - 1)} aria-disabled={page <= 1}>
              {b.pagination.previous}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {fmt(b.pagination.pageOf, { page, pages })}
          </span>
          <Button asChild variant="outline" className={page >= pages ? "pointer-events-none opacity-50" : ""}>
            <Link href={href(page + 1)} aria-disabled={page >= pages}>
              {b.pagination.next}
            </Link>
          </Button>
        </nav>
      )}
    </>
  )
}

export default async function BlogPage({ searchParams }: PageProps<"/[lang]/blog">) {
  const { t } = await getI18n()
  return (
    <>
      <PageHeader eyebrow={t.blog.header.eyebrow} title={t.blog.header.title} description={t.blog.header.description} />
      <section className="container-page py-14 sm:py-20">
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <PostList searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  )
}
