"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useAdminUser } from "@/components/admin/admin-shell"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ApiError, call } from "@/lib/client-api"

const schema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(10, "Use at least 10 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.new_password === v.confirm, { path: ["confirm"], message: "Passwords do not match" })
type Values = z.infer<typeof schema>

export function AccountSettings() {
  const user = useAdminUser()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { current_password: "", new_password: "", confirm: "" } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async ({ current_password, new_password }: Values) => {
    try {
      await call("change_password", { current_password, new_password })
      toast.success("Password updated")
      form.reset()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update password")
    }
  }

  return (
    <>
      <AdminPageHeader title="Account" description="Your profile and sign in details." />
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Change password</CardTitle>
            <CardDescription>Use a long passphrase you do not use anywhere else.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="max-w-sm">
                <Field data-invalid={!!errors.current_password}>
                  <FieldLabel htmlFor="current">Current password</FieldLabel>
                  <Input id="current" type="password" autoComplete="current-password" {...form.register("current_password")} />
                  <FieldError errors={[errors.current_password]} />
                </Field>
                <Field data-invalid={!!errors.new_password}>
                  <FieldLabel htmlFor="new">New password</FieldLabel>
                  <Input id="new" type="password" autoComplete="new-password" {...form.register("new_password")} />
                  <FieldError errors={[errors.new_password]} />
                </Field>
                <Field data-invalid={!!errors.confirm}>
                  <FieldLabel htmlFor="confirm">Confirm new password</FieldLabel>
                  <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
                  <FieldError errors={[errors.confirm]} />
                </Field>
                <Button type="submit" className="w-fit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />} Update password
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
