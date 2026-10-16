"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MailIcon, MailOpenIcon, PhoneIcon, ReplyIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { messagesQuery } from "@/lib/admin-queries"
import { call } from "@/lib/client-api"
import { formatDateTime } from "@/lib/format"
import type { ContactMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

export function MessagesInbox() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, isPending } = useQuery(messagesQuery(filter, page))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/admin/messages"] })
    queryClient.invalidateQueries({ queryKey: ["/admin/stats"] })
  }
  const markRead = useMutation({
    mutationFn: (args: { id: string; is_read: boolean }) => call("update_message", args),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: string) => call("delete_message", { id }),
    onSuccess: () => {
      toast.success("Message deleted")
      refresh()
    },
  })

  const toggle = (msg: ContactMessage) => {
    setOpenId(openId === msg.id ? null : msg.id)
    if (!msg.is_read) markRead.mutate({ id: msg.id, is_read: true })
  }

  return (
    <>
      <AdminPageHeader title="Messages" description="Inquiries sent through the contact form." />
      <Tabs
        value={filter}
        onValueChange={(v) => {
          setFilter(v as "all" | "unread")
          setPage(1)
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MailIcon />
            </EmptyMedia>
            <EmptyTitle>{filter === "unread" ? "All caught up" : "No messages yet"}</EmptyTitle>
            <EmptyDescription>Messages from the contact page will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-2">
          {data.items.map((msg) => {
            const open = openId === msg.id
            return (
              <li key={msg.id} className={cn("rounded-xl border bg-card transition-colors", !msg.is_read && "border-primary/30 bg-primary/[0.03]")}>
                <button type="button" onClick={() => toggle(msg)} className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={open}>
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", msg.is_read ? "bg-transparent" : "bg-primary")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className={cn("font-medium", !msg.is_read && "font-semibold")}>{msg.name}</p>
                      <p className="text-sm text-muted-foreground">{msg.email}</p>
                      {!msg.is_read && <Badge className="h-5">New</Badge>}
                    </div>
                    <p className="truncate text-sm">{msg.subject}</p>
                    {!open && <p className="truncate text-sm text-muted-foreground">{msg.message}</p>}
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">{formatDateTime(msg.created_at)}</time>
                </button>
                {open && (
                  <div className="space-y-4 border-t px-4 py-4 pl-9">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}>
                          <ReplyIcon /> Reply by email
                        </a>
                      </Button>
                      {msg.phone && (
                        <Button asChild size="sm" variant="outline">
                          <a href={`tel:${msg.phone.replace(/\s/g, "")}`}>
                            <PhoneIcon /> {msg.phone}
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ id: msg.id, is_read: false })}>
                        <MailOpenIcon /> Mark unread
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(msg.id)}>
                        <Trash2Icon /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {data && data.pages > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  )
}
