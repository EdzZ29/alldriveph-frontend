import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

export function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  return ""
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
          a: ({ href, children }) => {
            const external = href?.startsWith("http")
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            )
          },
          // never render raw images at arbitrary sizes inside articles
          // article images can be any URL an editor pastes, so the next/image allowlist does not apply
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => (typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" className="my-6 rounded-2xl border" /> : null),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
