"use client"

// The chat bubble in the bottom right corner of every page. Common questions are answered right
// here from the FAQ list. Anything typed goes to the API: the assistant answers what it can and
// the team sees the conversation in the admin panel at once. Replies arrive live (Server-Sent
// Events), so the visitor never has to refresh. The conversation survives page changes and
// reloads through a secret kept in this browser.

import { BotIcon, MessageCircleIcon, SendIcon, XIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { useI18n } from "@/components/i18n/provider"
import { Spinner } from "@/components/ui/spinner"
import { continuesGroup } from "@/lib/chat"
import { ApiError, call } from "@/lib/client-api"
import { fmt } from "@/lib/i18n/config"
import type { ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "adp_chat"

interface Access {
  id: string
  token: string
}

/** A bubble on screen: a stored message, or a common question answered in the browser. */
type Bubble = Pick<ChatMessage, "id" | "sender" | "author" | "body"> & { created_at?: string }

function readAccess(): Access | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Access) : null
  } catch {
    return null
  }
}

function writeAccess(access: Access | null) {
  try {
    if (access) localStorage.setItem(STORAGE_KEY, JSON.stringify(access))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // private mode: the chat still works until the page is closed
  }
}

/** Adds messages that are not on screen yet (the live stream and the API answer may both deliver one). */
function merge(current: Bubble[], incoming: Bubble[]) {
  const seen = new Set(current.map((m) => m.id))
  const fresh = incoming.filter((m) => !seen.has(m.id))
  return fresh.length ? [...current, ...fresh] : current
}

const subscribeNothing = () => () => {}

export function ChatWidget({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const { t, lang } = useI18n()
  const c = t.nav.chatWidget
  const pathname = usePathname()
  // the bubble only renders in the browser, so the server HTML never disagrees with it
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false)

  const [open, setOpen] = useState(false)
  const [access, setAccess] = useState<Access | null>(null)
  const [messages, setMessages] = useState<Bubble[]>([])
  // how many messages there were when the visitor last looked, for the badge on the bubble
  const [seen, setSeen] = useState(0)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const localId = useRef(0)

  // pick up a conversation started earlier in this browser
  useEffect(() => {
    const saved = readAccess()
    if (!saved) return
    call<{ messages: ChatMessage[] }>("chat_messages", { ...saved })
      .then((data) => {
        setAccess(saved)
        setMessages((current) => merge(current, data.messages))
        setSeen(data.messages.length)
      })
      .catch((err) => {
        // gone or no longer valid: start fresh next time
        if (err instanceof ApiError && err.status === 404) writeAccess(null)
      })
  }, [])

  // live replies from the team and the assistant
  useEffect(() => {
    if (!access) return
    const source = new EventSource(`/api/v1/events?chat=${access.id}&token=${encodeURIComponent(access.token)}`)
    let opened = false
    source.onopen = () => {
      // after a reconnect, fetch anything that arrived while the stream was down
      if (opened) {
        void call<{ messages: ChatMessage[] }>("chat_messages", { ...access })
          .then((data) => setMessages((current) => merge(current, data.messages)))
          .catch(() => {})
      }
      opened = true
    }
    source.addEventListener("message", (e) => {
      const message = JSON.parse((e as MessageEvent).data) as ChatMessage
      setMessages((current) => merge(current, [message]))
    })
    return () => source.close()
  }, [access])

  const count = messages.length
  useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [open, count, sending])

  if (!mounted) return null

  const ask = (faq: { question: string; answer: string }) => {
    const n = ++localId.current
    setMessages((current) => [
      ...current,
      { id: `local-q${n}`, sender: "visitor", author: null, body: faq.question },
      { id: `local-a${n}`, sender: "bot", author: null, body: faq.answer },
    ])
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setError(null)
    try {
      if (access) {
        const data = await call<{ messages: ChatMessage[] }>("chat_send", { ...access, message: text })
        setMessages((current) => merge(current, data.messages))
      } else {
        const data = await call<{ id: string; token: string; messages: ChatMessage[] }>("chat_start", {
          message: text,
          lang,
          page: pathname,
        })
        const created = { id: data.id, token: data.token }
        writeAccess(created)
        setAccess(created)
        setMessages((current) => merge(current, data.messages))
      }
      setDraft("")
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 500 ? err.message : c.failed)
    } finally {
      setSending(false)
    }
  }

  const unseen = open ? 0 : messages.slice(seen).filter((m) => m.sender !== "visitor").length
  const typed = messages.some((m) => m.sender === "visitor" && !m.id.startsWith("local-"))

  // closed, the bubble sits below the cookie banner (z-50) so it never covers its buttons;
  // opened on purpose, the chat comes to the front
  return (
    <div className={cn("fixed right-4 bottom-4 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6", open ? "z-[60]" : "z-40")}>
      {open && (
        <section
          role="dialog"
          aria-label={c.title}
          className="flex h-[min(36rem,calc(100svh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] animate-in fade-in-0 slide-in-from-bottom-4"
        >
          <header className="flex items-center gap-3 bg-ink px-4 py-3.5 text-ink-foreground">
            <span className="relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <MessageCircleIcon className="size-5" />
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-success ring-2 ring-ink" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="truncate text-xs text-ink-muted">{c.status}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={c.close}
              className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-white/10 hover:text-white"
            >
              <XIcon className="size-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4" aria-live="polite">
            <BotBubble label={c.assistant} body={c.greeting} />
            {!typed && faqs.length > 0 && (
              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold text-muted-foreground">{c.common}</p>
                <div className="flex flex-wrap gap-2">
                  {faqs.map((faq) => (
                    <button
                      key={faq.question}
                      type="button"
                      onClick={() => ask(faq)}
                      className="rounded-full border bg-background px-3 py-1.5 text-left text-sm transition-colors hover:border-primary hover:text-brand-strong"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, i) => {
              // a burst from the same person stacks closely, with the name shown once
              const grouped = continuesGroup(messages[i - 1], message)
              return message.sender === "visitor" ? (
                <p
                  key={message.id}
                  className={cn(
                    "ml-auto w-fit max-w-[85%] rounded-2xl bg-primary px-3.5 py-2 text-sm whitespace-pre-line text-primary-foreground",
                    grouped ? "-mt-2" : "rounded-br-sm"
                  )}
                >
                  {message.body}
                </p>
              ) : (
                <BotBubble
                  key={message.id}
                  label={message.sender === "bot" ? c.assistant : (message.author ?? c.team)}
                  body={message.body}
                  staff={message.sender === "staff"}
                  grouped={grouped}
                />
              )
            })}
            {sending && (
              <p className="ml-auto flex w-fit items-center gap-2 rounded-2xl bg-primary/70 px-3.5 py-2 text-sm text-primary-foreground">
                <Spinner className="size-3.5" /> {draft.trim()}
              </p>
            )}
            <div ref={bottom} />
          </div>

          <form
            className="border-t bg-background p-3"
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
          >
            {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder={c.placeholder}
                aria-label={c.placeholder}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border bg-muted/40 px-3 py-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                aria-label={c.send}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
              >
                <SendIcon className="size-4.5" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setSeen(messages.length)
        }}
        aria-label={open ? c.close : c.open}
        aria-expanded={open}
        data-chat-toggle
        className="relative flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-[0_12px_32px_-8px] shadow-primary/60 transition-transform hover:scale-[1.03] active:scale-95"
      >
        {open ? <XIcon className="size-5" /> : <MessageCircleIcon className="size-5" />}
        <span className="max-sm:hidden">{open ? c.close : c.open}</span>
        {unseen > 0 && !open && (
          <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full bg-destructive px-1.5 text-xs leading-6 font-bold text-white" aria-label={fmt(c.newMessages, { count: unseen })}>
            {unseen}
          </span>
        )}
      </button>
    </div>
  )
}

function BotBubble({ label, body, staff, grouped }: { label: string; body: string; staff?: boolean; grouped?: boolean }) {
  return (
    <div className={cn("flex max-w-[85%] flex-col gap-1", grouped && "-mt-2")}>
      {!grouped && (
        <span className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
          {!staff && <BotIcon className="size-3" />}
          {label}
        </span>
      )}
      <p
        className={cn(
          "w-fit rounded-2xl border px-3.5 py-2 text-sm whitespace-pre-line",
          !grouped && "rounded-bl-sm",
          staff ? "border-primary/30 bg-primary/10" : "bg-background"
        )}
      >
        {body}
      </p>
    </div>
  )
}
