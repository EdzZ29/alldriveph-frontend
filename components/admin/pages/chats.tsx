"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArchiveIcon, ArchiveRestoreIcon, BotIcon, MessageCircleIcon, SendIcon, UserRoundIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { chatQuery, chatsQuery, type ChatFilter } from "@/lib/admin-queries"
import { call } from "@/lib/client-api"
import { continuesGroup } from "@/lib/chat"
import { formatDateTime } from "@/lib/format"
import type { ChatConversation, ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

function shortTime(iso: string) {
  const date = new Date(iso)
  const today = new Date().toDateString() === date.toDateString()
  return date.toLocaleString("en-PH", today ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric" })
}

/** The staff inbox for the website chat. New messages arrive through the live stream. */
export function ChatInbox() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [filter, setFilter] = useState<ChatFilter>("open")
  const openId = search.get("open")
  const { data, isPending } = useQuery(chatsQuery(filter))

  const open = (id: string | null) => {
    const params = new URLSearchParams(search.toString())
    if (id) params.set("open", id)
    else params.delete("open")
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false })
  }

  return (
    <>
      <AdminPageHeader title="Chats" description="Messages from the chat bubble on the website. The assistant answers common questions; you take it from there." />
      <div className="grid h-[calc(100svh-15rem)] min-h-[32rem] overflow-hidden rounded-xl border bg-card md:grid-cols-[20rem_1fr]">
        <aside className={cn("flex min-h-0 flex-col border-r", openId && "max-md:hidden")}>
          <div className="border-b p-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as ChatFilter)}>
              <TabsList className="w-full">
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isPending ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : !data?.items.length ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No {filter === "all" ? "" : filter} chats yet.</p>
            ) : (
              data.items.map((chat) => <ChatRow key={chat.id} chat={chat} active={chat.id === openId} onOpen={() => open(chat.id)} />)
            )}
          </div>
        </aside>
        <section className={cn("flex min-h-0 flex-col", !openId && "max-md:hidden")}>
          {openId ? (
            <Conversation key={openId} id={openId} onBack={() => open(null)} />
          ) : (
            <Empty className="m-auto">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleIcon />
                </EmptyMedia>
                <EmptyTitle>Pick a chat</EmptyTitle>
                <EmptyDescription>New messages show up here instantly, no refresh needed.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </>
  )
}

function ChatRow({ chat, active, onOpen }: { chat: ChatConversation; active: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("flex w-full gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-accent", active && "bg-accent")}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-brand-strong">
        <UserRoundIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", chat.staff_unread ? "font-semibold" : "font-medium")}>
            Visitor · {chat.lang.toUpperCase()}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{shortTime(chat.last_message_at)}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", chat.staff_unread ? "text-foreground" : "text-muted-foreground")}>{chat.last_message}</span>
          {chat.staff_unread > 0 && (
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-destructive px-1.5 text-xs leading-5 font-bold text-white">{chat.staff_unread}</span>
          )}
        </span>
      </span>
    </button>
  )
}

function Conversation({ id, onBack }: { id: string; onBack: () => void }) {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery(chatQuery(id))
  const [draft, setDraft] = useState("")
  const bottom = useRef<HTMLDivElement>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["/admin/chats"] })
    void queryClient.invalidateQueries({ queryKey: ["/admin/chat", id] })
  }
  const reply = useMutation({
    mutationFn: (message: string) => call<ChatMessage>("chat_reply", { id, message }),
    onSuccess: (message) => {
      setDraft("")
      queryClient.setQueryData(chatQuery(id).queryKey, (old) =>
        old && !old.messages.some((m) => m.id === message.id) ? { ...old, messages: [...old.messages, message] } : old
      )
      refresh()
    },
  })
  const status = useMutation({
    mutationFn: (next: "open" | "closed") => call("update_chat", { id, status: next }),
    onSuccess: refresh,
  })

  const count = data?.messages.length ?? 0
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" })
  }, [count])

  if (isPending || !data) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="ml-auto h-10 w-1/2" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  const { conversation, messages } = data
  const send = () => {
    const text = draft.trim()
    if (text && !reply.isPending) reply.mutate(text)
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={onBack}>
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            Website visitor
            <Badge variant={conversation.status === "open" ? "default" : "secondary"}>{conversation.status === "open" ? "Open" : "Closed"}</Badge>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Started {formatDateTime(conversation.created_at)}
            {conversation.page ? ` on ${conversation.page}` : ""} · {conversation.lang.toUpperCase()}
          </p>
        </div>
        {conversation.status === "open" ? (
          <Button variant="outline" size="sm" disabled={status.isPending} onClick={() => status.mutate("closed")}>
            <ArchiveIcon /> Close
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={status.isPending} onClick={() => status.mutate("open")}>
            <ArchiveRestoreIcon /> Reopen
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4">
        {messages.map((message, i) => (
          <Bubble key={message.id} message={message} grouped={continuesGroup(messages[i - 1], message)} />
        ))}
        <div ref={bottom} />
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)"
          rows={2}
          maxLength={2000}
          className="min-h-11 resize-none"
        />
        <Button type="submit" size="icon-lg" disabled={!draft.trim() || reply.isPending} aria-label="Send reply">
          {reply.isPending ? <Spinner /> : <SendIcon />}
        </Button>
      </form>
    </>
  )
}

/** One message; `grouped` messages follow the previous one from the same person without a new label. */
function Bubble({ message, grouped }: { message: ChatMessage; grouped: boolean }) {
  const mine = message.sender === "staff"
  const label = message.sender === "visitor" ? "Visitor" : message.sender === "bot" ? "Assistant (automatic)" : (message.author ?? "Team")
  return (
    <div className={cn("flex flex-col gap-1", grouped ? "mt-1" : "mt-4 first:mt-0", mine || message.sender === "bot" ? "items-end" : "items-start")}>
      {!grouped && (
        <span className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
          {message.sender === "bot" && <BotIcon className="size-3" />}
          {label} · {shortTime(message.created_at)}
        </span>
      )}
      <p
        title={grouped ? shortTime(message.created_at) : undefined}
        className={cn(
          "max-w-[min(32rem,85%)] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line",
          message.sender === "visitor" && (grouped ? "border bg-card" : "rounded-tl-sm border bg-card"),
          message.sender === "bot" && (grouped ? "bg-secondary text-secondary-foreground" : "rounded-tr-sm bg-secondary text-secondary-foreground"),
          mine && (grouped ? "bg-primary text-primary-foreground" : "rounded-tr-sm bg-primary text-primary-foreground")
        )}
      >
        {message.body}
      </p>
    </div>
  )
}
