"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useSearch } from "@/lib/providers/search-provider"

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
  const router = useRouter()
  const { setSearchQuery, setSearchSection } = useSearch()

  const handleSearch = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setSearchQuery(text)
    setSearchSection(section)
    router.push("/search")
  }

  return (
    <TooltipProvider>
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
    </TooltipProvider>
  )
}
