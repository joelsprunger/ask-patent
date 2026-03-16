"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatentSectionData, SECTION_LABELS } from "@/types/patent-types"
import { getPatentSectionsAction } from "@/actions/db/patents-actions"
import { SectionToc } from "./section-toc"
import { SummaryModal } from "./summary-modal"

const SCROLL_CONTAINER_ID = "document-scroll-container"

interface DocumentTabProps {
  patentId: string
}

export function DocumentTab({ patentId }: DocumentTabProps) {
  const [sections, setSections] = useState<PatentSectionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    getPatentSectionsAction(patentId).then(result => {
      if (result.isSuccess && result.data) {
        setSections(result.data)
        if (result.data.length > 0) {
          setActiveSection(result.data[0].section_type)
        }
      }
      setIsLoading(false)
    })
  }, [patentId])

  // Set up IntersectionObserver scrollspy after sections load
  const setupScrollspy = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()

    const container = document.getElementById(SCROLL_CONTAINER_ID)
    if (!container || sections.length === 0) return

    const headings = sections.map(s =>
      document.getElementById(`section-${s.section_type}`)
    ).filter(Boolean) as HTMLElement[]

    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      entries => {
        // Find the topmost visible heading
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          const id = visible[0].target.id.replace("section-", "")
          setActiveSection(id)
        }
      },
      {
        root: container,
        rootMargin: "-10% 0px -80% 0px",
        threshold: 0
      }
    )

    headings.forEach(el => observerRef.current!.observe(el))
  }, [sections])

  useEffect(() => {
    // Small delay to let the DOM render sections first
    const t = setTimeout(setupScrollspy, 100)
    return () => {
      clearTimeout(t)
      observerRef.current?.disconnect()
    }
  }, [setupScrollspy])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 dark:text-zinc-400">
        No sections available for this patent.
      </div>
    )
  }

  return (
    <>
      <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
        {/* Left ToC sidebar */}
        <div className="w-48 flex-shrink-0 pr-4 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 py-2">
          <SectionToc
            sections={sections}
            activeSection={activeSection}
            scrollContainerId={SCROLL_CONTAINER_ID}
          />
        </div>

        {/* Main scrollable content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-end px-6 py-2 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSummaryOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </Button>
          </div>

          {/* Sections */}
          <div
            id={SCROLL_CONTAINER_ID}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-10"
          >
            {sections.map(sec => (
              <section key={sec.section_type}>
                <h2
                  id={`section-${sec.section_type}`}
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-800"
                >
                  {SECTION_LABELS[sec.section_type] ?? sec.section_type}
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {sec.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <SummaryModal
        patentId={patentId}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
    </>
  )
}
