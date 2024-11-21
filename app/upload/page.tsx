"use client"

import { useState } from "react"
import { PDFDropzone } from "@/components/ui/pdf-dropzone"
import { PreviewModal } from "@/components/ui/preview-modal"
import { ParsedModal } from "@/components/ui/parsed-modal"
import { Toaster } from "react-hot-toast"
import { parsePdfAction } from "@/actions/parse-actions"
import { ParsedResult } from "@/lib/parser/types"
import toast from "react-hot-toast"

export default function UploadPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isParsedModalOpen, setIsParsedModalOpen] = useState(false)
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileConverted = (pngUrl: string, originalFile: File) => {
    setPreviewUrl(pngUrl)
    setPdfFile(originalFile)
    setIsPreviewModalOpen(true)
  }

  const handleParse = async () => {
    if (!pdfFile) {
      toast.error("No PDF file selected")
      return
    }

    try {
      setIsLoading(true)
      const result = await parsePdfAction(pdfFile)

      if (!result.isSuccess) {
        throw new Error(result.message)
      }

      setParsedResult(result.data ?? null)
      setIsPreviewModalOpen(false)
      setIsParsedModalOpen(true)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse PDF"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">PDF Parser</h1>
          <p className="text-gray-500">
            Drop your PDF file here to parse its contents
          </p>
        </div>

        <PDFDropzone onFileConverted={handleFileConverted} />

        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          imageUrl={previewUrl}
          onParse={handleParse}
          isLoading={isLoading}
        />

        <ParsedModal
          isOpen={isParsedModalOpen}
          onClose={() => setIsParsedModalOpen(false)}
          parsedResult={parsedResult}
        />

        <Toaster position="bottom-right" />
      </div>
    </div>
  )
}
