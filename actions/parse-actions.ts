"use server"

import { MegaParseVision } from "@/lib/parser/mega-parse-vision"
import { ActionState } from "@/types"
import { ParsedResult } from "@/lib/parser/types"

export async function parsePdfAction(
  file: File
): Promise<ActionState<ParsedResult>> {
  try {
    const parser = new MegaParseVision({
      modelName: "gpt-4-vision-preview"
    })

    const result = await parser.convert(file)

    return {
      isSuccess: true,
      message: "Successfully parsed PDF",
      data: result
    }
  } catch (error) {
    console.error("Error parsing PDF:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to parse PDF"
    }
  }
}
