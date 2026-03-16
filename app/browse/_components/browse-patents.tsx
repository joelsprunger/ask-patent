"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  createColumnHelper
} from "@tanstack/react-table"
import { LayoutGrid, List } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Patent, PatentFilter, PatentQuery } from "@/types/patent-types"
import { getFilteredPatentsAction } from "@/actions/db/patents-actions"
import { SearchBar } from "./search-bar"
import { PatentTableView } from "./patent-table-view"
import { PatentTileView } from "./patent-tile-view"
import Link from "next/link"

type ViewMode = "table" | "tile"

const PAGE_SIZE = 50

const columnHelper = createColumnHelper<Patent>()

const columns: ColumnDef<Patent, string>[] = [
  columnHelper.accessor("patent_number", {
    header: "Patent #",
    size: 130,
    cell: info => info.getValue()
  }),
  columnHelper.accessor("title", {
    header: "Title",
    size: 480,
    cell: info => {
      const abstract = info.row.original.abstract
      const link = (
        <Link
          href={`/patents/${info.row.original.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
          onClick={e => e.stopPropagation()}
        >
          {info.getValue()}
        </Link>
      )
      if (!abstract) return link
      return (
        <Tooltip delayDuration={600}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-sm text-xs leading-relaxed"
          >
            {abstract}
          </TooltipContent>
        </Tooltip>
      )
    }
  }),
  columnHelper.accessor(row => row.inventors?.join(", ") ?? "", {
    id: "inventor",
    header: "Inventors",
    size: 220,
    cell: info => {
      const value = info.getValue()
      const inventors = info.row.original.inventors
      if (!value) return <span className="text-zinc-400">—</span>
      // Only show tooltip if there are multiple inventors (truncation likely)
      if (!inventors || inventors.length <= 1) return <span>{value}</span>
      return (
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <span className="truncate block cursor-default">{value}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            <ul className="space-y-0.5">
              {inventors.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )
    }
  }),
  columnHelper.accessor(row => row.filing_date ?? "", {
    id: "filing_date",
    header: "Filed",
    size: 100,
    cell: info => {
      const v = info.getValue()
      return v ? new Date(v).toLocaleDateString() : <span className="text-zinc-400">—</span>
    }
  }),
  columnHelper.accessor(row => row.date_published ?? "", {
    id: "date_published",
    header: "Published",
    size: 105,
    cell: info => {
      const v = info.getValue()
      return v ? new Date(v).toLocaleDateString() : <span className="text-zinc-400">—</span>
    }
  })
] as ColumnDef<Patent, string>[]

export default function BrowsePatents() {
  const [view, setView] = useState<ViewMode>("table")
  const [patents, setPatents] = useState<Patent[]>([])
  const [filters, setFilters] = useState<PatentFilter>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: "title", desc: false }])
  const [searchDraft, setSearchDraft] = useState("")
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)

  // Debounce column filters (not search — that's explicit on Enter)
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildQuery = useCallback(
    (cursor?: string): PatentQuery => {
      const sort = sorting[0] ?? { id: "title", desc: false }
      return {
        filters,
        sortBy: sort.id,
        sortOrder: sort.desc ? "desc" : "asc",
        cursor,
        limit: PAGE_SIZE,
        direction: "forward"
      }
    },
    [filters, sorting]
  )

  const load = useCallback(
    async (reset = false) => {
      if (reset) {
        setIsLoading(true)
        setPatents([])
        setNextCursor(null)
      } else {
        setIsFetchingMore(true)
      }

      const cursor = reset ? undefined : nextCursor ?? undefined
      const result = await getFilteredPatentsAction(buildQuery(cursor))

      if (result.isSuccess && result.data) {
        const { patents: newPatents, nextCursor: nc, totalCount: tc } = result.data
        setPatents(prev => (reset ? newPatents : [...prev, ...newPatents]))
        setNextCursor(nc)
        setHasNextPage(nc !== null)
        if (reset) setTotalCount(tc)
      }

      setIsLoading(false)
      setIsFetchingMore(false)
    },
    [buildQuery, nextCursor]
  )

  // Initial load + reload on filter/sort change
  useEffect(() => {
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sorting])

  const handleSearch = useCallback(
    (value: string) => {
      setFilters(prev => ({ ...prev, search: value || undefined }))
    },
    []
  )

  const handleFilterChange = useCallback(
    (key: keyof PatentFilter, value: string) => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current)
      filterDebounceRef.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }))
      }, 400)
    },
    []
  )

  const handleRemoveFilter = useCallback((key: keyof PatentFilter) => {
    setFilters(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (key === "search") setSearchDraft("")
  }, [])

  const table = useReactTable({
    data: patents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualFiltering: true
  })

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar
          value={searchDraft}
          onChange={setSearchDraft}
          onSearch={handleSearch}
        />

        <div className="flex items-center gap-1 ml-auto">
          {totalCount !== null && (
            <span className="text-xs text-zinc-500 mr-2">
              {isLoading
                ? "Loading…"
                : `${patents.length.toLocaleString()} of ${totalCount.toLocaleString()} patent${totalCount !== 1 ? "s" : ""}${activeFilterCount > 0 ? " (filtered)" : ""}`}
            </span>
          )}
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className={`h-8 w-8 flex items-center justify-center transition-colors ${
                view === "table"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("tile")}
              aria-label="Tile view"
              className={`h-8 w-8 flex items-center justify-center transition-colors ${
                view === "tile"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Views */}
      {view === "table" ? (
        <PatentTableView
          table={table}
          filters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          isFetchingMore={isFetchingMore}
          hasNextPage={hasNextPage}
          onLoadMore={() => load(false)}
        />
      ) : (
        <PatentTileView
          patents={patents}
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onEditFilters={() => setView("table")}
          isLoading={isLoading}
          isFetchingMore={isFetchingMore}
          hasNextPage={hasNextPage}
          onLoadMore={() => load(false)}
        />
      )}
    </div>
  )
}
