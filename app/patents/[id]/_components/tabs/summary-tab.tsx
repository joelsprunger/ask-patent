"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { PatentSection } from "@/types/patent-types"
import { getPatentSummaryAction } from "@/actions/patents-actions"
import { getPatentSection } from "@/actions/supabase-actions"
import { Loader2 } from "lucide-react"
import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"
import { LRUCache } from "@/lib/utils/lru-cache"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { RefreshCw } from "lucide-react"
import { Components } from "react-markdown"
import { Copy, Check } from "lucide-react"

interface SummaryTabProps {
  patentId: string
}

// Create LRU cache instance for sections and summaries
const sectionCache = new LRUCache<string, string>(50) // Cache up to 50 sections
const summaryCache = new LRUCache<string, string>(50) // Cache up to 50 summaries

// Shared markdown components configuration
const markdownComponents: Partial<Components> = {
  h1: ({ ...props }) => <h1 className="mb-4 text-xl font-bold" {...props} />,
  h2: ({ ...props }) => (
    <h2 className="mt-6 mb-4 text-lg font-semibold" {...props} />
  ),
  ul: ({ ...props }) => <ul className="my-4 list-disc pl-6" {...props} />,
  li: ({ ...props }) => <li className="mt-2" {...props} />,
  p: ({ ...props }) => <p className="my-4" {...props} />
}

export function SummaryTab({ patentId }: SummaryTabProps) {
  const [section, setSection] = useState<PatentSection>("summary")
  const [sectionText, setSectionText] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchSection = async () => {
      const cacheKey = `${patentId}/${section}`

      // Try cache first
      const cachedText = sectionCache.get(cacheKey)
      if (cachedText) {
        setSectionText(cachedText)
        return
      }

      // Fetch from Supabase if not in cache
      const text = await getPatentSection(patentId, section)
      setSectionText(text)
      sectionCache.set(cacheKey, text)
    }

    // Try to get cached summary
    const cachedSummary = summaryCache.get(`${patentId}/${section}`)
    if (cachedSummary) {
      setSummary(cachedSummary)
    } else {
      setSummary("")
    }

    fetchSection()
  }, [patentId, section])

  async function handleGenerateSummary() {
    setIsLoading(true)
    try {
      const response = await getPatentSummaryAction(patentId, section)
      if (response.isSuccess && response.data) {
        setSummary(response.data)
        summaryCache.set(`${patentId}/${section}`, response.data)
      }
    } catch (err) {
      console.error("Failed to process summary:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-2 h-full">
      <div className="flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Select
            value={section}
            onValueChange={value => setSection(value as PatentSection)}
          >
            <SelectTrigger className="w-[300px] text-xl font-semibold bg-black text-white border border-gray-700">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white border border-gray-700">
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="background">Background</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="claims">Claims</SelectItem>
              <SelectItem value="drawings">Drawings</SelectItem>
              <SelectItem value="detailed_description">
                Detailed Description
              </SelectItem>
              <SelectItem value="full_content">Full Content</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="prose prose-invert max-w-none overflow-auto max-h-[calc(100vh-250px)] p-4">
          {sectionText ? (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {sectionText}
            </Markdown>
          ) : (
            <div className="text-center text-muted-foreground">
              No content available for this section
            </div>
          )}
        </div>
      </div>

      <div className="border-l border-gray-700 relative group">
        {!isLoading && (
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            {summary && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy summary</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleGenerateSummary}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate summary</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {!summary && (
              <Button onClick={handleGenerateSummary}>Generate Summary</Button>
            )}
          </div>
        )}
        {isLoading && (
          <div className="absolute right-4 top-4 z-10">
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </Button>
          </div>
        )}
        <div className="prose prose-invert max-w-none overflow-auto max-h-[calc(100vh-250px)] p-4">
          {summary && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {summary}
            </Markdown>
          )}
        </div>
      </div>
    </div>
  )
}
