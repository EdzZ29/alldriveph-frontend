"use client"

import { MailIcon, SendIcon } from "lucide-react"
import { useState } from "react"

import { useI18n } from "@/components/i18n/provider"
import { chatChannels } from "@/components/site/contact-channels"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fmt } from "@/lib/i18n/config"
import { site } from "@/lib/site"

// the email to our team stays in English, whatever language the form is shown in
const PARTNER_TYPES = [
  "Car rental owner or operator",
  "Hotel or resort",
  "Travel agency or tour operator",
  "Blogger or content creator",
  "Business or corporate account",
  "Other",
]

/**
 * Front end only: nothing is stored on our servers. Submitting opens the visitor's
 * email app with the application filled in, addressed to the Alldrive inbox.
 */
export function AffiliateSignup() {
  const [type, setType] = useState(PARTNER_TYPES[0])
  const { t } = useI18n()
  const f = t.affiliate.form

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const line = (label: string, key: string) => `${label}: ${String(data.get(key) ?? "").trim() || "-"}`
    const body = [
      "Hi Alldrive team, I would like to join the affiliate program.",
      "",
      line("Name", "name"),
      line("Business or website", "business"),
      `Partner type: ${type}`,
      line("City", "city"),
      line("Mobile", "phone"),
      line("Email", "email"),
      "",
      line("About me", "message"),
    ].join("\n")
    const href = `mailto:${site.email}?subject=${encodeURIComponent("Affiliate program application")}&body=${encodeURIComponent(body)}`
    window.location.href = href
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] border bg-card p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="aff-name">{f.name}</FieldLabel>
            <Input id="aff-name" name="name" required autoComplete="name" className="h-11 rounded-xl" />
          </Field>
          <Field>
            <FieldLabel htmlFor="aff-business">{f.business}</FieldLabel>
            <Input id="aff-business" name="business" placeholder={f.businessPlaceholder} className="h-11 rounded-xl" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="aff-type">{f.type}</FieldLabel>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="aff-type" className="h-11! w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_TYPES.map((value, i) => (
                  <SelectItem key={value} value={value}>
                    {f.types[i] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="aff-city">{f.city}</FieldLabel>
            <Input id="aff-city" name="city" required placeholder={f.cityPlaceholder} className="h-11 rounded-xl" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="aff-phone">{f.phone}</FieldLabel>
            <Input id="aff-phone" name="phone" type="tel" required autoComplete="tel" className="h-11 rounded-xl" />
          </Field>
          <Field>
            <FieldLabel htmlFor="aff-email">{f.email}</FieldLabel>
            <Input id="aff-email" name="email" type="email" required autoComplete="email" className="h-11 rounded-xl" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="aff-message">
            {f.about} <span className="font-normal text-muted-foreground">{f.optional}</span>
          </FieldLabel>
          <Textarea id="aff-message" name="message" rows={3} placeholder={f.aboutPlaceholder} className="rounded-xl" />
        </Field>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button type="submit" size="xl" className="rounded-full px-8 font-semibold shadow-[0_12px_28px_-12px] shadow-primary/70">
            <SendIcon /> {f.submit}
          </Button>
          <p className="text-sm text-muted-foreground italic">{f.free}</p>
        </div>
        <FieldDescription className="flex items-start gap-2">
          <MailIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {fmt(f.opensEmail, { email: site.email })}{" "}
            {chatChannels.slice(0, 2).map((c, i) => (
              <span key={c.key}>
                {i > 0 && ` ${f.or} `}
                <a href={c.href} className="font-medium text-foreground underline underline-offset-4" {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {c.label}
                </a>
              </span>
            ))}
            .
          </span>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
