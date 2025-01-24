"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback
} from "react"
import { Patent } from "@/types/patent-types"
import { searchPatentsAction } from "@/actions/search-actions"

interface SearchContextType {
  searchQuery: string
  searchSection?: string
  isSearching: boolean
  searchResults: Patent[]
  setSearchQuery: (query: string) => void
  setSearchSection: (section?: string) => void
  executeSearch: () => Promise<void>
  clearSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSection, setSearchSection] = useState<string | undefined>()
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Patent[]>([])

  const executeSearch = useCallback(async () => {
    if (!searchQuery) return

    setIsSearching(true)
    try {
      const { isSuccess, data } = await searchPatentsAction(
        searchQuery,
        10,
        searchSection
      )
      if (isSuccess && data) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, searchSection])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setSearchSection(undefined)
    setSearchResults([])
  }, [])

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchSection,
        isSearching,
        searchResults,
        setSearchQuery,
        setSearchSection,
        executeSearch,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
