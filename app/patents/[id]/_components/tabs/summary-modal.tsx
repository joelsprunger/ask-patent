"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { getCachedSummaryAction } from "@/actions/db/patents-actions"
import { generateHolisticSummaryAction } from "@/actions/patents-actions"

interface SummaryModalProps {
  patentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SummaryModal({ patentId, open, onOpenChange }: SummaryModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load cached summary when modal opens
  useEffect(() => {
    if (!open) return
    if (summary !== null) return // already loaded

    setIsLoading(true)
    setError(null)

    getCachedSummaryAction(patentId).then(result => {
      setIsLoading(false)
      if (result.isSuccess && result.data) {
        setSummary(result.data.text)
        setGeneratedAt(result.data.generated_at)
      }
      // null data = not yet cached, will show Generate button
    })
  }, [open, patentId, summary])

  const generate = async () => {
    setIsGenerating(true)
    setError(null)

    const result = await generateHolisticSummaryAction(patentId)

    setIsGenerating(false)

    if (result.isSuccess && result.data) {
      setSummary(result.data.summary)
      setGeneratedAt(result.data.generated_at)
    } else {
      setError(result.message)
    }
  }

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Patent Summary</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          )}

          {!isLoading && !summary && !isGenerating && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
                Generate a holistic 3-paragraph AI summary of this patent covering
                its invention, technical innovations, and scope.
              </p>
              <Button onClick={generate}>Generate Summary</Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Generating summary…
              </p>
            </div>
          )}

          {!isLoading && !isGenerating && summary && (
            <div className="space-y-4">
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap text-sm">
                {summary}
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {!isLoading && summary && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
            {formattedDate && (
              <span className="text-xs text-zinc-400">
                Generated {formattedDate}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={generate}
              disabled={isGenerating}
              className="ml-auto gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
