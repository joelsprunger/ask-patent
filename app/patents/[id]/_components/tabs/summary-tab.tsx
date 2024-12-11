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
import { Loader2 } from "lucide-react"
import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"

interface SummaryTabProps {
  patentId: string
}

export function SummaryTab({ patentId }: SummaryTabProps) {
  const [section, setSection] = useState<PatentSection>("summary")
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem(`summary/${patentId}/${section}`)
    if (cached) {
      setSummary(cached)
    }
  }, [patentId, section])

  async function handleGenerateSummary() {
    setIsLoading(true)
    try {
      const response = await getPatentSummaryAction(patentId, section)
      if (response.isSuccess && response.data) {
        setSummary(response.data)
        localStorage.setItem(`summary/${patentId}/${section}`, response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={section}
          onValueChange={value => setSection(value as PatentSection)}
        >
          <SelectTrigger className="w-[200px] bg-black text-white border border-gray-700">
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

        <Button onClick={handleGenerateSummary} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Summary
        </Button>
      </div>

      {summary ? (
        <div className="prose prose-headings:mt-4 prose-p:mt-2 prose-ul:mt-2 max-w-none dark:prose-invert">
          <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => <h1 className="mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="mt-6 mb-4">{children}</h2>,
              ul: ({ children }) => (
                <ul className="my-4 list-disc pl-6">{children}</ul>
              ),
              li: ({ children }) => <li className="mt-2">{children}</li>
            }}
          >
            {summary}
          </Markdown>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          Select a section and generate a summary
        </div>
      )}
    </div>
  )
}
