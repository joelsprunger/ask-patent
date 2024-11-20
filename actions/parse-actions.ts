"use server"

import { MegaParseVision } from "@/lib/parser/mega-parse-vision"
import { ActionState } from "@/types"
import { ParsedResult } from "@/lib/parser/types"

export async function parsePdfAction(
  file: File
): Promise<ActionState<ParsedResult>> {
  try {
    const megaParseVision = new MegaParseVision({
      modelName: process.env.OPENAI_MODEL_NAME as string
    })

    const result = await megaParseVision.convert(file)

    return {
      isSuccess: true,
      message: "PDF processed successfully",
      data: result
    }
  } catch (error) {
    console.error("Error processing PDF:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to process PDF"
    }
  }
}
