"use client"

import { useSearch } from "@/lib/providers/search-provider"
import { PatentCard } from "@/components/ui/patent-card"

export default function SearchPatents() {
  const { searchResults } = useSearch()

  return (
    <div className="space-y-4">
      {searchResults.map((patent, index) => (
        <PatentCard key={patent.id} patent={patent} index={index} />
      ))}
    </div>
  )
}
