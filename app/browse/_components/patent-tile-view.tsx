"use client"

import { useRef, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Loader2 } from "lucide-react"
import { Patent, PatentFilter } from "@/types/patent-types"
import { PatentCard } from "@/components/ui/patent-card"
import { FilterChips } from "./filter-chips"

interface PatentTileViewProps {
  patents: Patent[]
  filters: PatentFilter
  onRemoveFilter: (key: keyof PatentFilter) => void
  onEditFilters: () => void
  isLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  onLoadMore: () => void
}

export function PatentTileView({
  patents,
  filters,
  onRemoveFilter,
  onEditFilters,
  isLoading,
  isFetchingMore,
  hasNextPage,
  onLoadMore
}: PatentTileViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const totalItems = hasNextPage ? patents.length + 1 : patents.length

  const virtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 5
  })

  const virtualItems = virtualizer.getVirtualItems()

  const onLoaderVisible = useCallback(() => {
    if (!isFetchingMore && hasNextPage) onLoadMore()
  }, [isFetchingMore, hasNextPage, onLoadMore])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-col gap-2">
      {hasActiveFilters && (
        <FilterChips
          filters={filters}
          onRemove={onRemoveFilter}
          onEditFilters={onEditFilters}
        />
      )}

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: "calc(100vh - 240px)" }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualItems.map(virtualRow => {
            const isLoaderRow = virtualRow.index >= patents.length

            if (isLoaderRow) {
              onLoaderVisible()
              return (
                <div
                  key="loader"
                  style={{
                    position: "absolute",
                    top: virtualRow.start,
                    left: 0,
                    width: "100%",
                    height: virtualRow.size
                  }}
                  className="flex items-center justify-center py-4"
                >
                  {isFetchingMore && (
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  )}
                </div>
              )
            }

            const patent = patents[virtualRow.index]
            return (
              <div
                key={patent.id}
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  left: 0,
                  width: "100%"
                }}
              >
                <PatentCard
                  patent={patent}
                  isLink={true}
                  animate={false}
                  index={virtualRow.index}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
