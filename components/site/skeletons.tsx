import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function VehicleGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[16/10] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
            <Skeleton className="mt-2 h-7 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border bg-card p-6">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  )
}

export function SearchSkeleton() {
  return <Skeleton className="h-[76px] w-full rounded-2xl max-lg:h-[300px]" />
}
