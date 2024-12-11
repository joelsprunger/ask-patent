"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { PatentCard } from "@/components/ui/patent-card"
import { searchPatentsAction } from "@/actions/search-actions"
import { Patent } from "@/types/patent-types"

const CACHE_KEY = "patent_search_results"
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutes

export default function SearchPatents() {
  const [query, setQuery] = useState("")
  const [patents, setPatents] = useState<Patent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load cached results on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        setPatents(data)
      } else {
        localStorage.removeItem(CACHE_KEY)
      }
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const result = await searchPatentsAction(query)
      if (result.isSuccess && result.data) {
        setPatents(result.data.data)
        // Cache the results
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: result.data.data,
            timestamp: Date.now()
          })
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search patents..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <div className="space-y-4">
        {patents.map((patent, index) => (
          <PatentCard key={patent.id} patent={patent} index={index} />
        ))}
      </div>
    </div>
  )
}
