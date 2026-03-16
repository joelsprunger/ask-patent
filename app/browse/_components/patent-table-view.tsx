"use client"

import React, { useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  flexRender,
  Table as TanTable,
  SortingState
} from "@tanstack/react-table"
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from "lucide-react"
import { Patent, PatentFilter } from "@/types/patent-types"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"

const NO_FILTER_COLUMNS = new Set(["abstract", "assignee"])

interface PatentTableViewProps {
  table: TanTable<Patent>
  patents: Patent[]
  sorting: SortingState
  filters: PatentFilter
  onFilterChange: (key: keyof PatentFilter, value: string) => void
  isLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  onLoadMore: () => void
}

export function PatentTableView({
  table,
  patents,
  sorting,
  filters,
  onFilterChange,
  isLoading,
  isFetchingMore,
  hasNextPage,
  onLoadMore
}: PatentTableViewProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)

  const rows = table.getRowModel().rows
  const totalRows = hasNextPage ? rows.length + 1 : rows.length

  const virtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10
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

  const headerGroups = table.getHeaderGroups()

  const colStyle = (colId: string, size: number): React.CSSProperties =>
    colId === "title"
      ? { flex: "1 1 0", minWidth: size }
      : { flex: `0 0 ${size}px`, width: size }

  return (
    <TooltipProvider>
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 220px)" }}>

        {/* Sticky header */}
        <div className="flex-shrink-0 overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
          {headerGroups.map(headerGroup => (
            <div
              key={headerGroup.id}
              className="flex w-full"
            >
              {headerGroup.headers.map(header => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                const colId = header.column.id
                return (
                  <div
                    key={header.id}
                    className="px-3 pt-2 pb-1 overflow-hidden"
                    style={colStyle(colId, header.getSize())}
                  >
                    <button
                      className={`flex items-center gap-1 text-left font-semibold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-wide w-full ${canSort ? "cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" : "cursor-default"}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      disabled={!canSort}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-zinc-400 ml-1 flex-shrink-0">
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </button>
                    {!NO_FILTER_COLUMNS.has(colId) && (
                      <Input
                        value={(filters[colId as keyof PatentFilter] as string) ?? ""}
                        onChange={e =>
                          onFilterChange(colId as keyof PatentFilter, e.target.value)
                        }
                        placeholder="Filter…"
                        className="h-7 text-xs mt-1 bg-white dark:bg-zinc-800"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div ref={parentRef} className="flex-1 overflow-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }} className="w-full">
            {virtualItems.map(virtualRow => {
              const isLoaderRow = virtualRow.index >= rows.length

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
                    className="flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    )}
                  </div>
                )
              }

              const row = rows[virtualRow.index]
              return (
                <div
                  key={row.id}
                  onClick={() => router.push(`/patents/${row.original.id}`)}
                  className="flex cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 transition-colors"
                  style={{
                    position: "absolute",
                    top: virtualRow.start,
                    left: 0,
                    width: "100%",
                    height: virtualRow.size
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <div
                      key={cell.id}
                      className="px-3 py-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis"
                      style={colStyle(cell.column.id, cell.column.getSize())}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}
