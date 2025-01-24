"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { PatentCard } from "@/components/ui/patent-card"
import { useSearch } from "@/lib/providers/search-provider"

export default function SearchPatents() {
  const [localQuery, setLocalQuery] = useState("")
  const { searchResults, isSearching, setSearchQuery, executeSearch } =
    useSearch()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localQuery.trim()) return

    setSearchQuery(localQuery)
    await executeSearch()
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search patents..."
          value={localQuery}
          onChange={e => setLocalQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="space-y-4">
        {searchResults.map((patent, index) => (
          <PatentCard key={patent.id} patent={patent} index={index} />
        ))}
      </div>
    </div>
  )
}
