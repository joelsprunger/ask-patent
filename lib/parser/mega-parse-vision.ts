import { TagEnum, ParserOptions, ParsedResult } from "./types"
import { BASE_OCR_PROMPT } from "./prompts"
import OpenAI from "openai"
import { PDFDocument } from "pdf-lib"
import * as upng from "@pdf-lib/upng"

export class MegaParseVision {
  private model: string
  private openai: OpenAI
  private parsedChunks: string[] | null = null

  constructor(options: ParserOptions) {
    const supportedModels = [
      "gpt-4-vision-preview",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229"
    ]

    if (!supportedModels.includes(options.model)) {
      throw new Error(
        "Invalid model name. MegaParse vision only supports models with vision capabilities."
      )
    }

    this.model = options.model
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  private async processFile(file: File): Promise<string[]> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const imagesBase64: string[] = []

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPages()[i]
        const { width, height } = page.getSize()

        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create()
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i])
        singlePagePdf.addPage(copiedPage)

        // Convert to PNG
        const pngBytes = await singlePagePdf.saveAsBase64({ dataUri: true })
        const pngImage = await upng.decode(Buffer.from(pngBytes, "base64"))
        const base64Image = Buffer.from(pngImage.data).toString("base64")

        imagesBase64.push(base64Image)
      }

      return imagesBase64
    } catch (error) {
      throw new Error(`Error processing PDF file: ${error}`)
    }
  }

  private getElement(tag: TagEnum, chunk: string): string[] {
    const pattern = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "g")
    const matches = Array.from(chunk.matchAll(pattern))

    if (!matches.length) {
      console.log(`No ${tag} found in the chunk`)
      return []
    }

    return matches.map(match => match[1].trim())
  }

  private async sendToMLM(imagesData: string[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: BASE_OCR_PROMPT },
              ...imagesData.map(image => ({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image}` }
              }))
            ]
          }
        ]
      })

      return response.choices[0].message.content || ""
    } catch (error) {
      throw new Error(`Error processing with language model: ${error}`)
    }
  }

  private getCleanedContent(parsedFile: string): string {
    // Handle HEADER tag specially
    const headerPattern = new RegExp(
      `\\[${TagEnum.HEADER}\\](.*?)\\[\\/${TagEnum.HEADER}\\]`,
      "s"
    )
    const headers = parsedFile.match(headerPattern)
    let cleanedContent = parsedFile

    if (headers) {
      const firstHeader = headers[0].replace(headerPattern, "$1").trim()
      cleanedContent = cleanedContent.replace(headerPattern, "")
      cleanedContent = `${firstHeader}\n${cleanedContent}`
    }

    // Remove all other tags
    Object.values(TagEnum).forEach(tag => {
      const tagPattern = new RegExp(`\\[${tag}\\](.*?)\\[\\/${tag}\\]`, "gs")
      cleanedContent = cleanedContent.replace(tagPattern, "$1")
    })

    // Clean up formatting
    cleanedContent = cleanedContent
      .replace(/^```.*$\n?/gm, "")
      .replace(/\n\s*\n/g, "\n\n")
      .replace(/\|\n\n\|/g, "|\n|")
      .trim()

    return cleanedContent
  }

  public async convert(
    file: File,
    batchSize: number = 3
  ): Promise<ParsedResult> {
    const pdfBase64 = await this.processFile(file)
    const batches: string[][] = []

    // Create batches of images
    for (let i = 0; i < pdfBase64.length; i += batchSize) {
      batches.push(pdfBase64.slice(i, i + batchSize))
    }

    // Process all batches concurrently
    this.parsedChunks = await Promise.all(
      batches.map(batch => this.sendToMLM(batch))
    )

    const joinedContent = this.parsedChunks.join("\n")
    const cleanedContent = this.getCleanedContent(joinedContent)

    return {
      content: cleanedContent,
      chunks: this.parsedChunks
    }
  }
}
