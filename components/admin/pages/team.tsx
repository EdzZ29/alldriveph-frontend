"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { KeyRoundIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useAdminUser } from "@/components/admin/admin-shell"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { call } from "@/lib/client-api"
import { usersQuery } from "@/lib/admin-queries"
import { formatDateTime } from "@/lib/format"
import type { BranchCode, User, UserRole } from "@/lib/types"

const BRANCHES: { code: BranchCode; name: string }[] = [
  { code: "butuan", name: "Butuan" },
  { code: "cagayan-de-oro", name: "Cagayan de Oro" },
  { code: "davao", name: "Davao" },
]
const branchName = (code: BranchCode | null) => BRANCHES.find((b) => b.code === code)?.name ?? "All branches"

const newUserSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter a name"),
    email: z.email("Enter a valid email"),
    password: z.string().min(10, "At least 10 characters"),
    role: z.enum(["admin", "staff", "owner"]),
    branch: z.enum(["butuan", "cagayan-de-oro", "davao"]).nullable(),
  })
  .refine((v) => v.role !== "owner" || v.branch, { message: "Choose the branch this owner manages", path: ["branch"] })
type NewUser = z.infer<typeof newUserSchema>


export function TeamManager() {
  const me = useAdminUser()
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [resetting, setResetting] = useState<User | null>(null)
  const { data, isPending } = useQuery({
    ...usersQuery(),
  })

  const update = useMutation({
    mutationFn: ({ id, ...input }: { id: string; role?: UserRole; branch?: BranchCode; is_active?: boolean; password?: string }) =>
      call("update_user", { id, input }),
    onSuccess: () => {
      toast.success("Team member updated")
      setResetting(null)
      queryClient.invalidateQueries({ queryKey: ["/admin/users"] })
    },
  })

  if (me.role !== "admin") {
    return <p className="text-muted-foreground">Only administrators can manage the team.</p>
  }

  return (
    <>
      <AdminPageHeader
        title="Team"
        description="Only admins add and edit accounts. Staff run bookings and content. Branch owners run the bookings and fleet of their own branch."
        actions={
          <Button onClick={() => setAdding(true)}>
            <PlusIcon /> Add member
          </Button>
        }
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        {isPending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="hidden md:table-cell">Last sign in</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((user) => {
                const self = user.id === me.id
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">
                        {user.full_name} {self && <Badge variant="secondary">You</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Select value={user.role} disabled={self} onValueChange={(role) => update.mutate({ id: user.id, role: role as UserRole })}>
                        <SelectTrigger size="sm" className="w-36" aria-label="Role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          {/* a new owner needs a branch, so owners are added with "Add member" */}
                          {user.role === "owner" && <SelectItem value="owner">Branch owner</SelectItem>}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.role === "owner" ? (
                        <Select value={user.branch ?? undefined} onValueChange={(branch) => update.mutate({ id: user.id, branch: branch as BranchCode })}>
                          <SelectTrigger size="sm" className="w-40" aria-label="Branch">
                            <SelectValue placeholder="Choose branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANCHES.map((b) => (
                              <SelectItem key={b.code} value={b.code}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">{branchName(null)}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {user.last_login_at ? formatDateTime(user.last_login_at) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_active}
                        disabled={self}
                        aria-label="Active"
                        onCheckedChange={(is_active) => update.mutate({ id: user.id, is_active })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label="Reset password" onClick={() => setResetting(user)}>
                        <KeyRoundIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AddMemberDialog open={adding} onOpenChange={setAdding} />
      <ResetPasswordDialog
        user={resetting}
        onClose={() => setResetting(null)}
        saving={update.isPending}
        onSave={(password) => resetting && update.mutate({ id: resetting.id, password })}
      />
    </>
  )
}

function AddMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const form = useForm<NewUser>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { full_name: "", email: "", password: "", role: "staff", branch: null },
  })
  const role = useWatch({ control: form.control, name: "role" })
  const create = useMutation({
    mutationFn: (input: NewUser) => call("create_user", { input: { ...input, branch: input.role === "owner" ? input.branch : null } }),
    onSuccess: () => {
      toast.success("Team member added")
      form.reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["/admin/users"] })
    },
  })
  const { errors } = form.formState

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>Share the password with them securely. They can change it after signing in.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => create.mutate(v))} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.full_name}>
              <FieldLabel htmlFor="tm-name">Full name</FieldLabel>
              <Input id="tm-name" {...form.register("full_name")} />
              <FieldError errors={[errors.full_name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="tm-email">Email</FieldLabel>
              <Input id="tm-email" type="email" {...form.register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="tm-password">Temporary password</FieldLabel>
              <Input id="tm-password" type="text" autoComplete="new-password" {...form.register("password")} />
              <FieldError errors={[errors.password]} />
            </Field>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="tm-role">Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tm-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Branch owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {field.value === "owner"
                      ? "Confirms and cancels bookings made at their branch, and adds and edits that branch's cars."
                      : field.value === "admin"
                        ? "Full access, including team accounts."
                        : "Runs bookings and website content, but cannot add or edit accounts."}
                  </FieldDescription>
                </Field>
              )}
            />
            {role === "owner" && (
              <Controller
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <Field data-invalid={!!errors.branch}>
                    <FieldLabel htmlFor="tm-branch">Branch</FieldLabel>
                    <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                      <SelectTrigger id="tm-branch" className="w-full">
                        <SelectValue placeholder="Choose branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b.code} value={b.code}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.branch]} />
                  </Field>
                )}
              />
            )}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner />} Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  user,
  onClose,
  onSave,
  saving,
}: {
  user: User | null
  onClose: () => void
  onSave: (password: string) => void
  saving: boolean
}) {
  const [password, setPassword] = useState("")
  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && (setPassword(""), onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>Set a new password for {user?.full_name}.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="reset-pw">New password</FieldLabel>
          <Input id="reset-pw" type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldDescription>At least 10 characters.</FieldDescription>
        </Field>
        <DialogFooter>
          <Button
            disabled={password.length < 10 || saving}
            onClick={() => {
              onSave(password)
              setPassword("")
            }}
          >
            {saving && <Spinner />} Save password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
