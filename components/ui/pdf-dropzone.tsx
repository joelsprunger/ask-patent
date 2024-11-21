"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload } from "lucide-react"
import { toast } from "react-hot-toast"
import * as pdfjsLib from "pdfjs-dist"

// Update worker source to use .mjs extension
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

interface PDFDropzoneProps {
  onFileConverted: (pngUrl: string, originalFile: File) => void
}

export function PDFDropzone({ onFileConverted }: PDFDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDrop: async acceptedFiles => {
      setIsDragging(false)
      if (acceptedFiles.length === 0) return

      setIsConverting(true)
      const file = acceptedFiles[0]

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1.5 })

        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        const context = canvas.getContext("2d")

        if (!context) {
          throw new Error("Could not get canvas context")
        }

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const pngUrl = canvas.toDataURL()
        onFileConverted(pngUrl, file)
      } catch (error) {
        toast.error("Error converting PDF")
        console.error(error)
      } finally {
        setIsConverting(false)
      }
    }
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 
          transition-colors duration-150 ease-in-out
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          hover:border-blue-500 hover:bg-blue-50
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                {isConverting ? "Converting..." : "Drop your PDF here"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                or click to select a file
              </p>
            </div>

            {isConverting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/80 flex items-center justify-center"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-gray-700">
                    Converting PDF...
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
