"use client"

import * as pdfjsLib from "pdfjs-dist"

export function createPDFWorker() {
  if (typeof window === "undefined") return

  const workerUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs"
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
}

export async function convertPDFToImages(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const images: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise

      images.push(canvas.toDataURL("image/jpeg", 0.8))
    }

    return images
  } catch (error) {
    console.error("Error converting PDF:", error)
    throw new Error("Failed to process PDF. Please try again.")
  }
}
