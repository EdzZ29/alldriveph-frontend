import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserRoundIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "@/components/i18n/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Markdown } from "@/components/site/markdown"
import { ApiErrorState, safeLoad } from "@/components/site/api-error"
import { CtaBanner } from "@/components/site/cta-banner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { alternatesFor, fmt } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { breadcrumbSchema, JsonLd } from "@/lib/seo"
import { site } from "@/lib/site"

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const { data: post } = await safeLoad(() => api.post(slug))
  const { t, lang } = await getI18n()
  if (!post) return { title: t.blog.articleNotFound }
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: alternatesFor(lang, `/blog/${post.slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
      authors: [post.author_name],
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  }
}

async function Article({ params }: { params: PageProps<"/[lang]/blog/[slug]">["params"] }) {
  const { t, lang } = await getI18n()
  const { slug } = await params
  const result = await safeLoad(() => api.post(slug))
  if (result.error) return <ApiErrorState />

  const post = result.data
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: post.author_name },
    publisher: { "@type": "Organization", name: site.name },
  }

  return (
    <article>
      <JsonLd
        data={[
          jsonLd,
          breadcrumbSchema([
            { name: t.blog.breadcrumbHome, path: "/" },
            { name: t.blog.header.eyebrow, path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <header className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-brand-strong hover:bg-primary/15">
              {tag}
            </Link>
          ))}
        </div>
        <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">{post.title}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserRoundIcon className="size-4" /> {post.author_name}
          </span>
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4" /> {formatDate(post.published_at, lang)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <ClockIcon className="size-4" /> {fmt(t.common.units.minRead, { count: post.reading_minutes })}
          </span>
        </div>
      </header>
      {post.cover_image_url && (
        <div className="car-panel relative my-10 aspect-[2/1] rounded-3xl border">
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized={post.cover_image_url.startsWith("/media/")}
            className="object-contain p-8"
          />
        </div>
      )}
      <Markdown>{post.content}</Markdown>
    </article>
  )
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { t } = await getI18n()
  return (
    <>
      <div className="container-page max-w-3xl py-10 sm:py-14">
        <Button asChild variant="ghost" className="-ml-2 mb-8 text-muted-foreground">
          <Link href="/blog">
            <ArrowLeftIcon /> {t.blog.allArticles}
          </Link>
        </Button>
        <Suspense
          fallback={
            <div className="space-y-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-10 aspect-[2/1] rounded-3xl" />
            </div>
          }
        >
          <Article params={params} />
        </Suspense>
      </div>
      <CtaBanner />
    </>
  )
}
