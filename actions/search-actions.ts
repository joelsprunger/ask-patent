"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { SearchResponse } from "@/types/patent-types"
import { ActionState } from "@/types"

export async function searchPatentsAction(
  query: string
): Promise<ActionState<SearchResponse>> {
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
    if (!apiUrl) {
      throw new Error("API URL not configured")
    }

    const url = new URL("/search/patents", apiUrl)
    url.searchParams.append("query", query)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to search patents")
    }

    const data = await response.json()

    return {
      isSuccess: true,
      message: "Patents retrieved successfully",
      data
    }
  } catch (error) {
    console.error("Error searching patents:", error)
    return { isSuccess: false, message: "Failed to search patents" }
  }
}
