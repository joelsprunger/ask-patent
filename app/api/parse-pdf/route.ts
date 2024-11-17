import { NextResponse } from "next/server"
import { MegaParseVision } from "@/lib/parser/mega-parse-vision"

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const parser = new MegaParseVision({ modelName: "gpt-4o" })
    const result = await parser.convert(file)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process PDF"
      },
      { status: 500 }
    )
  }
}
