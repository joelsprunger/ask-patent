"use client"

import { useEffect } from "react"
import { Suspense } from "react"
import SearchPatents from "./_components/search-patents"
import { SearchSkeleton } from "./_components/search-skeleton"
import { useSearch } from "@/lib/providers/search-provider"

export default function SearchPage() {
  const { searchQuery, executeSearch } = useSearch()

  useEffect(() => {
    if (searchQuery) {
      executeSearch()
    }
  }, [searchQuery, executeSearch])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Patent Search</h1>

      <div className="mb-4">
        <label className="text-sm font-medium">Search Text:</label>
        <p className="text-sm">{searchQuery}</p>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchPatents />
      </Suspense>
    </div>
  )
}
