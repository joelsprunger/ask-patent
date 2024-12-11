"use server"

import { Suspense } from "react"
import SearchPatents from "./_components/search-patents"
import { SearchSkeleton } from "./_components/search-skeleton"

export default async function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Patent Search</h1>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchPatents />
      </Suspense>
    </div>
  )
}
