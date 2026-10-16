"use client"

import { ImageIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError, uploadImage } from "@/lib/client-api"
import { statusLabels, statusStyles } from "@/lib/format"
import type { BookingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </Badge>
  )
}

export function ImageField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Images must be 5 MB or smaller")
    setUploading(true)
    try {
      onChange(await uploadImage(file))
      toast.success("Image uploaded")
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex gap-3">
      <div className="car-panel relative grid size-20 shrink-0 place-items-center rounded-xl border">
        {value ? (
          <Image src={value} alt="" fill unoptimized className="object-contain p-1.5" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/cars/example.png" />
          {value && (
            <Button type="button" variant="ghost" size="icon" aria-label="Remove image" onClick={() => onChange("")}>
              <XIcon />
            </Button>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />} Upload image
          </Button>
          <span className="ml-2 text-xs text-muted-foreground">JPG, PNG or WEBP up to 5 MB</span>
        </div>
      </div>
    </div>
  )
}
