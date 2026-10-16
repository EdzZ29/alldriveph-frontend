"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ApiError, call } from "@/lib/client-api"

const schema = z.object({
  email: z.email("Enter your work email"),
  password: z.string().min(1, "Enter your password"),
})
type Values = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: Values) => {
    setError(null)
    try {
      await call("login", values)
      const next = params.get("next")
      // only allow internal admin redirects
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Please try again.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[1.75rem] border bg-card/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8" noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <InputGroup className="h-12 rounded-xl">
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput id="email" type="email" autoComplete="username" placeholder="you@alldriveph.com" autoFocus {...form.register("email")} />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup className="h-12 rounded-xl">
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput id="password" placeholder="Your password" type={showPassword ? "text" : "password"} autoComplete="current-password" {...form.register("password")} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.password]} />
        </Field>
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="xl" className="group h-12 w-full rounded-full text-base font-semibold shadow-[0_12px_28px_-12px] shadow-primary/70" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null} Sign in
          {!isSubmitting && <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5" />}
        </Button>
      </FieldGroup>
    </form>
  )
}
