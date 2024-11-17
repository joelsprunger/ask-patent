"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { parsePdfAction } from "@/actions/parse-actions"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ParsedResult } from "@/lib/parser/types"

export default function FileUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ParsedResult | null>(null)
  const { toast } = useToast()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true)
      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      const response = await parsePdfAction(file)

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message)
      }

      setResult(response.data)
      toast({
        title: "Success",
        description: response.message
      })
    } catch (error) {
      console.error("Error processing files:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={isLoading}>
            <span>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload PDF"
              )}
            </span>
          </Button>
        </label>
      </div>

      {result && (
        <Card className="p-4">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
