"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"

export async function summarizeTextAction(
  text: string,
  nWords: number = 5
): Promise<ActionState<string>> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        isSuccess: false,
        message: "Not authenticated"
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX
    if (!apiUrl || !apiPrefix) {
      throw new Error("API URL or prefix not configured")
    }
    const url = new URL(`${apiPrefix}/utils/summarize`, apiUrl)
    url.searchParams.append("input_text", text)
    url.searchParams.append("n_words", nWords.toString())

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to summarize text")
    }

    const data = await response.json()

    // Access summary from data.data.summary
    return {
      isSuccess: true,
      message: "Text summarized successfully",
      data: data.data.summary
    }
  } catch (error) {
    console.error("[Summarize Text] Error:", error)
    return { isSuccess: false, message: "Failed to summarize text" }
  }
}
