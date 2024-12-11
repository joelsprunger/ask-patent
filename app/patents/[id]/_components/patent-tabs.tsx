"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatentCard } from "@/components/ui/patent-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Patent } from "@/types/patents-types"
import { PatentSection } from "@/types/patent-types"
import { getPatentSummaryAction } from "@/actions/patents-actions"
import { Loader2 } from "lucide-react"
import Markdown from "react-markdown"
import { Input } from "@/components/ui/input"
import { askPatentQuestionAction } from "@/actions/patents-actions"

interface PatentTabsProps {
  similarPatents: Patent[]
  patentId: string
}

export function PatentTabs({ similarPatents, patentId }: PatentTabsProps) {
  const [section, setSection] = useState<PatentSection>("summary")
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isAskLoading, setIsAskLoading] = useState(false)

  // Load from localStorage on mount
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
      console.log("[Patent Summary] Response:", response)
      if (response.isSuccess && response.data) {
        setSummary(response.data)
        localStorage.setItem(`summary/${patentId}/${section}`, response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAskQuestion() {
    if (!question.trim()) return

    setIsAskLoading(true)
    try {
      const response = await askPatentQuestionAction(patentId, question)
      if (response.isSuccess && response.data) {
        setAnswer(response.data.answer)
      }
    } finally {
      setIsAskLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Patent Tools</h2>

      <Tabs defaultValue="related" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="ask">Ask Patent</TabsTrigger>
        </TabsList>

        <TabsContent value="related">
          <div className="grid gap-4">
            {similarPatents.map(patent => (
              <PatentCard
                key={patent.id}
                patent={patent}
                isLink={true}
                animate={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="summary">
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
                  components={{
                    // Add proper spacing for headings
                    h1: ({ children }) => <h1 className="mb-4">{children}</h1>,
                    h2: ({ children }) => (
                      <h2 className="mt-6 mb-4">{children}</h2>
                    ),
                    // Add proper spacing for lists
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
        </TabsContent>

        <TabsContent value="ask">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about this patent..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="flex-1"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleAskQuestion()
                  }
                }}
              />
              <Button onClick={handleAskQuestion} disabled={isAskLoading}>
                {isAskLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ask
              </Button>
            </div>

            {answer ? (
              <div className="prose prose-headings:mt-4 prose-p:mt-2 prose-ul:mt-2 max-w-none dark:prose-invert">
                <Markdown
                  components={{
                    h1: ({ children }) => <h1 className="mb-4">{children}</h1>,
                    h2: ({ children }) => (
                      <h2 className="mt-6 mb-4">{children}</h2>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 list-disc pl-6">{children}</ul>
                    ),
                    li: ({ children }) => <li className="mt-2">{children}</li>
                  }}
                >
                  {answer}
                </Markdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Ask a question about this patent to get started
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
