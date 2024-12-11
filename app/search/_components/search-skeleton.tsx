"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>

      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-[300px] w-full" />
      ))}
    </div>
  )
}
