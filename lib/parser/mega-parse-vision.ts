import { TagEnum, ParserOptions, ParsedResult } from "./types"
import { BASE_OCR_PROMPT } from "./prompts"
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage } from "@langchain/core/messages"
import * as pdfjsLib from "pdfjs-dist"
import { createCanvas } from "@napi-rs/canvas"

export class MegaParseVision {
  private model: ChatOpenAI
  private parsedChunks: string[] | null = null

  constructor(options: ParserOptions) {
    const supportedModels = [
      "gpt-4o",
      "gpt-4o-turbo",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet",
      "claude-3-opus-20240229",
      "claude-3-opus"
    ]

    if (!supportedModels.includes(options.modelName)) {
      throw new Error(
        "Invalid model name. MegaParse vision only supports models with vision capabilities."
      )
    }

    this.model = new ChatOpenAI({
      modelName: options.modelName
    })
  }

  private async processFile(arrayBuffer: ArrayBuffer): Promise<string[]> {
    try {
      const imagesBase64: string[] = []

      // Load the PDF document using pdfjs-dist
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfDocument = await loadingTask.promise

      const numPages = pdfDocument.numPages

      for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
        const page = await pdfDocument.getPage(pageIndex)
        const viewport = page.getViewport({ scale: 2.0 })

        // Create a canvas using @napi-rs/canvas
        const canvas = createCanvas(viewport.width, viewport.height)
        const context = canvas.getContext("2d")

        const renderContext = {
          canvasContext: context as unknown as CanvasRenderingContext2D,
          viewport: viewport
        }

        // Render the page into the canvas
        await page.render(renderContext).promise

        // Convert the canvas to a PNG buffer
        const imageBuffer = canvas.toBuffer("image/png")

        // Convert the buffer to a base64 string
        const base64Image = imageBuffer.toString("base64")
        imagesBase64.push(base64Image)
      }

      return imagesBase64
    } catch (error: any) {
      throw new Error(`Error processing PDF file: ${error.message}`)
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
      const content = [
        {
          type: "text",
          text: BASE_OCR_PROMPT
        },
        ...imagesData.map(image => ({
          type: "image_url",
          image_url: `data:image/jpeg;base64,${image}`
        }))
      ]

      const message = new HumanMessage({ content })
      const response = await this.model.invoke([message])
      console.log(response)

      return response.content.toString()
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
    const arrayBuffer = await file.arrayBuffer()
    const pdfBase64 = await this.processFile(arrayBuffer)
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
