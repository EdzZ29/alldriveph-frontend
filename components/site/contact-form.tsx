"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2Icon, SendIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/components/i18n/provider"
import { ApiError, call } from "@/lib/client-api"
import type { Messages } from "@/lib/i18n/messages"

function makeSchema(e: Messages["contact"]["form"]["errors"]) {
  return z.object({
    name: z.string().trim().min(2, e.name),
    email: z.email(e.email),
    phone: z.string().trim().max(30).optional(),
    subject: z.string().trim().min(2, e.subject),
    message: z.string().trim().min(10, e.message),
    website: z.string().optional(),
  })
}
type Values = z.infer<ReturnType<typeof makeSchema>>

export function ContactForm() {
  const params = useSearchParams()
  const [sent, setSent] = useState(false)
  const { t } = useI18n()
  const c = t.contact.form
  const schema = useMemo(() => makeSchema(c.errors), [c.errors])
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", subject: params.get("subject") ?? "", message: "", website: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: Values) => {
    try {
      await call("send_contact_message", { input: { ...values, phone: values.phone || null } })
      setSent(true)
      form.reset()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : c.failed)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-10 text-center">
        <CheckCircle2Icon className="size-12 text-success" />
        <h2 className="text-2xl font-semibold">{c.sentTitle}</h2>
        <p className="max-w-sm text-muted-foreground">{c.sentBody}</p>
        <Button variant="outline" onClick={() => setSent(false)}>
          {c.sendAnother}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border bg-card p-5 sm:p-8" noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">{c.name}</FieldLabel>
            <Input id="name" autoComplete="name" className="h-11 rounded-xl" {...form.register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{c.email}</FieldLabel>
            <Input id="email" type="email" autoComplete="email" className="h-11 rounded-xl" {...form.register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">
              {c.mobile} <span className="font-normal text-muted-foreground">{c.optional}</span>
            </FieldLabel>
            <Input id="phone" type="tel" autoComplete="tel" className="h-11 rounded-xl" {...form.register("phone")} />
          </Field>
          <Field data-invalid={!!errors.subject}>
            <FieldLabel htmlFor="subject">{c.subject}</FieldLabel>
            <Input id="subject" className="h-11 rounded-xl" {...form.register("subject")} />
            <FieldError errors={[errors.subject]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="message">{c.message}</FieldLabel>
          <Textarea id="message" rows={6} className="rounded-xl" {...form.register("message")} />
          <FieldError errors={[errors.message]} />
        </Field>
        {/* honeypot, hidden from people */}
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
        <Button type="submit" size="xl" className="w-full sm:w-fit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <SendIcon />} {c.send}
        </Button>
      </FieldGroup>
    </form>
  )
}
