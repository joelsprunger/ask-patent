"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { searchPatentsAction } from "@/actions/search-actions"

interface SearchButtonProps {
  text: string
  className?: string
  iconSize?: number
  section?: string
}

export function SearchButton({
  text,
  className,
  iconSize = 3,
  section
}: SearchButtonProps) {
  const handleSearch = async () => {
    try {
      const { isSuccess, data } = await searchPatentsAction(text, 10, section)

      if (isSuccess && data) {
        // Handle the search results directly
        console.log("Search results:", data)
        // You can update UI state here or handle the results as needed
      }
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          onClick={handleSearch}
        >
          <Search className={`h-${iconSize} w-${iconSize}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Find patents similar to this text</p>
      </TooltipContent>
    </Tooltip>
  )
}
