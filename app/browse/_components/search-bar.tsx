"use client"

import { useState, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search patents by keyword..."
}: SearchBarProps) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(draft.trim())
  }

  const handleClear = () => {
    setDraft("")
    onChange("")
    onSearch("")
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <Input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {draft && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="default" size="sm">
        Search
      </Button>
    </form>
  )
}
