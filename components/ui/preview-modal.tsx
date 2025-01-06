"use client"

import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onParse: () => void
  isLoading: boolean
}

export function PreviewModal({
  isOpen,
  onClose,
  imageUrl,
  onParse,
  isLoading
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="rounded-lg object-contain"
              sizes="(max-width: 600px) 100vw, 600px"
              priority
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onParse} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Parse
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
