"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ParsedResult } from "@/lib/parser/types"

interface ParsedModalProps {
  isOpen: boolean
  onClose: () => void
  parsedResult: ParsedResult | null
}

export function ParsedModal({
  isOpen,
  onClose,
  parsedResult
}: ParsedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Parsed Result</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {parsedResult ? (
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(parsedResult, null, 2)}
            </pre>
          ) : (
            <p className="text-center text-gray-500">
              No parsed result available
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
