"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { Patent } from "@/types"

export async function searchPatentsAction(
  query: string,
  k: number = 10,
  section?: string
): Promise<ActionState<Patent[]>> {
  try {
    console.log("[Search Patents] Starting search with:", { query, k, section })
    
    const supabase = await createServerSupabaseClient()
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[Search Patents] No session found")
      return {
        isSuccess: false,
        message: "Not authenticated"
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.log("[Search Patents] API URL not configured")
      throw new Error("API URL not configured")
    }

    const url = new URL("/search/patents", apiUrl)
    
    // Create the request body according to the SearchRequest schema
    const requestBody = {
      query,
      k,
      ...(section && { section })
    }

    console.log("[Search Patents] Request URL:", url.toString())
    console.log("[Search Patents] Request body:", requestBody)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    console.log("[Search Patents] Response status:", response.status)
    
    const responseData = await response.json()
    console.log("[Search Patents] Response data:", responseData)

    if (!response.ok) {
      throw new Error(`Failed to search patents: ${responseData.message || 'Unknown error'}`)
    }

    return {
      isSuccess: true,
      message: "Search completed successfully",
      data: responseData.data
    }
  } catch (error) {
    console.error("[Search Patents] Error:", error)
    return { isSuccess: false, message: "Failed to search patents" }
  }
}
