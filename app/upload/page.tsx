"use client"

import { useState } from "react"
import { PDFDropzone } from "@/components/ui/pdf-dropzone"
import { PreviewModal } from "@/components/ui/preview-modal"
import { Toaster } from "react-hot-toast"

export default function UploadPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFileConverted = (pngUrl: string) => {
    setPreviewUrl(pngUrl)
    setIsModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">PDF to PNG Converter</h1>
          <p className="text-gray-500">
            Drop your PDF file here to convert it to PNG
          </p>
        </div>

        <PDFDropzone onFileConverted={handleFileConverted} />

        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={previewUrl}
        />

        <Toaster position="bottom-right" />
      </div>
    </div>
  )
}
