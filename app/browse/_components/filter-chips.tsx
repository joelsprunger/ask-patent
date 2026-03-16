"use client"

import { X } from "lucide-react"
import { PatentFilter } from "@/types/patent-types"

interface FilterChipsProps {
  filters: PatentFilter
  onRemove: (key: keyof PatentFilter) => void
  onEditFilters: () => void
}

const LABELS: Record<keyof PatentFilter, string> = {
  search: "Search",
  assignee: "Assignee",
  inventor: "Inventor",
  dateRange: "Date range",
  patentNumber: "Patent #"
}

export function FilterChips({ filters, onRemove, onEditFilters }: FilterChipsProps) {
  const active = (Object.keys(filters) as (keyof PatentFilter)[]).filter(k => {
    const v = filters[k]
    if (!v) return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 py-2">
      {active.map(key => {
        const val = filters[key]
        const display = Array.isArray(val) ? val.join(" – ") : String(val)
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200"
          >
            <span className="text-blue-500 dark:text-blue-400">{LABELS[key]}:</span>
            {display}
            <button
              onClick={() => onRemove(key)}
              className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
              aria-label={`Remove ${LABELS[key]} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )
      })}
      <button
        onClick={onEditFilters}
        className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline underline-offset-2"
      >
        Edit filters
      </button>
    </div>
  )
}
