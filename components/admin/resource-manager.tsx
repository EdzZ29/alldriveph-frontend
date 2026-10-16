"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontalIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm, type FieldValues } from "react-hook-form"
import { toast } from "sonner"

import { AdminPageHeader, ImageField } from "@/components/admin/admin-ui"
import { serviceIcons } from "@/components/site/icons"
import { Markdown } from "@/components/site/markdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { resourceQuery, type Resource } from "@/lib/admin-queries"
import { cn } from "@/lib/utils"

export type FieldType = "text" | "textarea" | "markdown" | "number" | "switch" | "select" | "list" | "image" | "icon"

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  description?: string
  options?: { value: string; label: string }[]
  /** full width inside the two column form grid */
  wide?: boolean
  min?: number
  nullable?: boolean
}

export interface Column<T> {
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

interface ResourceManagerProps<T extends { id: string }> {
  title: string
  description: string
  singular: string
  resource: Resource<T>
  fields: FieldDef[]
  columns: Column<T>[]
  defaults: FieldValues
  searchText: (row: T) => string
  itemLabel: (row: T) => string
  deleteHint?: string
  dialogClassName?: string
  /** false hides Delete, e.g. for branch owners who hide cars instead */
  canDelete?: boolean
}

/** Reads "a.b" style names one level deep, used for zone_rates.<zone>. */
function readPath(item: FieldValues, name: string) {
  const [head, tail] = name.split(".")
  return tail ? item[head]?.[tail] : item[head]
}

function writePath(target: FieldValues, name: string, value: unknown) {
  const [head, tail] = name.split(".")
  if (tail) target[head] = { ...(target[head] ?? {}), [tail]: value }
  else target[head] = value
}

/** react-hook-form treats dots as nesting, so form keys use "__" instead. */
const formKey = (name: string) => name.replace(".", "__")

function toFormValues(fields: FieldDef[], item: FieldValues): FieldValues {
  const values: FieldValues = {}
  for (const field of fields) {
    const raw = readPath(item, field.name)
    const key = formKey(field.name)
    if (field.type === "list") values[key] = Array.isArray(raw) ? raw.join("\n") : ""
    else if (field.type === "number") values[key] = raw === null || raw === undefined ? "" : String(raw)
    else if (field.type === "switch") values[key] = !!raw
    else values[key] = raw ?? ""
  }
  return values
}

function toPayload(fields: FieldDef[], values: FieldValues): FieldValues {
  const payload: FieldValues = {}
  for (const field of fields) {
    const raw = values[formKey(field.name)]
    let value: unknown
    switch (field.type) {
      case "list":
        value = String(raw ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
        break
      case "number":
        value = raw === "" || raw === null ? (field.nullable ? null : 0) : Number(raw)
        break
      case "switch":
        value = !!raw
        break
      default: {
        const text = typeof raw === "string" ? raw.trim() : raw
        value = text === "" && field.nullable ? null : text
      }
    }
    writePath(payload, field.name, value)
  }
  return payload
}

export function ResourceManager<T extends { id: string }>({
  title,
  description,
  singular,
  resource,
  fields,
  columns,
  defaults,
  searchText,
  itemLabel,
  deleteHint,
  canDelete = true,
  dialogClassName,
}: ResourceManagerProps<T>) {
  const queryClient = useQueryClient()
  const listQuery = resourceQuery(resource)
  const { queryKey } = listQuery
  const { data, isPending, isError, refetch } = useQuery(listQuery)

  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (data ?? []).filter((row) => !term || searchText(row).toLowerCase().includes(term))
  }, [data, search, searchText])

  const save = useMutation({
    mutationFn: (input: FieldValues) => (editing ? resource.update(editing.id, input) : resource.create(input)),
    onSuccess: () => {
      toast.success(`${singular} ${editing ? "updated" : "created"}`)
      setEditing(null)
      setCreating(false)
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const remove = useMutation({
    mutationFn: (row: T) => resource.remove(row.id),
    onSuccess: () => {
      toast.success(`${singular} deleted`)
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const open = creating || !!editing

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> Add {singular.toLowerCase()}
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-3">
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <span className="ml-auto text-sm text-muted-foreground">{data ? `${rows.length} of ${data.length}` : ""}</span>
        </div>

        {isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyTitle>Could not load {title.toLowerCase()}</EmptyTitle>
              <EmptyDescription>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : rows.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyTitle>{search ? "No matches" : `No ${title.toLowerCase()} yet`}</EmptyTitle>
              <EmptyDescription>{search ? "Try another search term." : `Add your first ${singular.toLowerCase()} to get started.`}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.header} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => setEditing(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${itemLabel(row)}`}>
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(row)}>
                          <PencilIcon /> Edit
                        </DropdownMenuItem>
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row)}>
                              <Trash2Icon /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            setEditing(null)
            setCreating(false)
          }
        }}
      >
        <DialogContent className={cn("max-h-[92vh] overflow-y-auto sm:max-w-2xl", dialogClassName)}>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</DialogTitle>
            <DialogDescription>{editing ? itemLabel(editing) : `Fill in the details below.`}</DialogDescription>
          </DialogHeader>
          {open && (
            <ResourceForm
              key={editing?.id ?? "new"}
              fields={fields}
              initial={toFormValues(fields, editing ?? defaults)}
              saving={save.isPending}
              onSubmit={(values) => save.mutate(toPayload(fields, values))}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(value) => !value && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting ? itemLabel(deleting) : ""}?</AlertDialogTitle>
            <AlertDialogDescription>{deleteHint ?? "This cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                if (deleting) remove.mutate(deleting)
              }}
              disabled={remove.isPending}
            >
              {remove.isPending && <Spinner />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ResourceForm({
  fields,
  initial,
  saving,
  onSubmit,
}: {
  fields: FieldDef[]
  initial: FieldValues
  saving: boolean
  onSubmit: (values: FieldValues) => void
}) {
  const form = useForm<FieldValues>({ defaultValues: initial })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        {fields.map((def) => (
          <Controller
            key={def.name}
            control={form.control}
            name={formKey(def.name)}
            rules={{
              validate: (value) => {
                if (def.required && (value === "" || value === null || value === undefined)) return `${def.label} is required`
                if (def.type === "number" && value !== "" && value !== null && def.min !== undefined && Number(value) < def.min)
                  return `${def.label} must be at least ${def.min}`
                return true
              },
            }}
            render={({ field, fieldState }) => {
              const id = `field-${def.name}`
              const wide = def.wide || ["textarea", "markdown", "list", "image"].includes(def.type)
              if (def.type === "switch") {
                return (
                  <Field orientation="horizontal" className="rounded-lg border p-3 sm:col-span-1">
                    <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} />
                    <FieldLabel htmlFor={id} className="font-normal">
                      {def.label}
                    </FieldLabel>
                  </Field>
                )
              }
              return (
                <Field data-invalid={fieldState.invalid} className={cn(wide && "sm:col-span-2")}>
                  <FieldLabel htmlFor={id}>
                    {def.label}
                    {!def.required && def.type !== "list" && <span className="font-normal text-muted-foreground">(optional)</span>}
                  </FieldLabel>
                  {def.type === "text" && <Input id={id} placeholder={def.placeholder} aria-invalid={fieldState.invalid} {...field} />}
                  {def.type === "number" && (
                    <Input id={id} type="number" inputMode="decimal" min={def.min} step="any" placeholder={def.placeholder} aria-invalid={fieldState.invalid} {...field} />
                  )}
                  {def.type === "textarea" && <Textarea id={id} rows={4} placeholder={def.placeholder} aria-invalid={fieldState.invalid} {...field} />}
                  {def.type === "list" && <Textarea id={id} rows={4} placeholder={def.placeholder ?? "One item per line"} {...field} />}
                  {def.type === "image" && <ImageField id={id} value={field.value ?? ""} onChange={field.onChange} />}
                  {def.type === "select" && (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {def.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {def.type === "icon" && (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder="Choose icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(serviceIcons).map(([name, Icon]) => (
                          <SelectItem key={name} value={name}>
                            <Icon /> {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {def.type === "markdown" && (
                    <Tabs defaultValue="write">
                      <TabsList>
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <Textarea id={id} rows={14} className="font-mono text-sm" placeholder={def.placeholder} aria-invalid={fieldState.invalid} {...field} />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="max-h-96 min-h-40 overflow-y-auto rounded-lg border p-4">
                          {field.value ? <Markdown>{field.value}</Markdown> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                  {def.description && !fieldState.error && <FieldDescription>{def.description}</FieldDescription>}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )
            }}
          />
        ))}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={saving}>
          {saving && <Spinner />} Save
        </Button>
      </DialogFooter>
    </form>
  )
}
