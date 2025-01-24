"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useState } from "react"

interface CopyButtonProps {
  text: string
  className?: string
  iconSize?: number
}

export function CopyButton({ text, className, iconSize = 3 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className={`h-${iconSize} w-${iconSize} text-green-500`} />
            ) : (
              <Copy className={`h-${iconSize} w-${iconSize}`} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy text</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
