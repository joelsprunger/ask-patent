"use client"

import { useState } from "react"
import { PDFDropzone } from "@/components/ui/pdf-dropzone"
import { PreviewModal } from "@/components/ui/preview-modal"
import { Toaster } from "react-hot-toast"

export default function PDFConverterPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFileConverted = (pngUrl: string) => {
    setPreviewUrl(pngUrl)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            PDF to PNG Converter
          </h1>
          <p className="mt-2 text-gray-600">
            Drop your PDF file here to convert it to PNG
          </p>
        </div>

        <PDFDropzone onFileConverted={handleFileConverted} />

        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={previewUrl}
        />
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
