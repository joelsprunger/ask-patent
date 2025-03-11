"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Patent } from "@/types/patent-types"
import { ActionState } from "@/types"

export async function getPatentByIdAction(
  id: string
): Promise<ActionState<Patent>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: patent, error } = await supabase
      .from("patents")
      .select()
      .eq("id", id)
      .single()

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patent retrieved successfully",
      data: patent
    }
  } catch (error) {
    console.error("Error getting patent:", error)
    return { isSuccess: false, message: "Failed to get patent" }
  }
}

export async function getSimilarPatentsAction(
  id: string
): Promise<ActionState<Patent[]>> {
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

    const url = new URL(`${apiPrefix}/patents/${id}/similar`, apiUrl)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to get similar patents")
    }

    const data = await response.json()

    return {
      isSuccess: true,
      message: "Similar patents retrieved successfully",
      data: data.data
    }
  } catch (error) {
    console.error("Error getting similar patents:", error)
    return { isSuccess: false, message: "Failed to get similar patents" }
  }
}

export async function getPaginatedPatentsAction(
  page: number,
  pageSize: number,
  sortBy: string = "title",
  sortOrder: "asc" | "desc" = "asc"
): Promise<ActionState<Patent[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: patents, error } = await supabase
      .from("patents")
      .select(
        "id, patent_number, title, authors, abstract, applicant, patent_type, filing_date, created_at, updated_at"
      )
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patents retrieved successfully",
      data: patents
    }
  } catch (error) {
    console.error("Error getting paginated patents:", error)
    return { isSuccess: false, message: "Failed to get paginated patents" }
  }
}

export async function getPatentsCountAction(): Promise<ActionState<number>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from("patents")
      .select("*", { count: "exact", head: true })

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patent count retrieved successfully",
      data: count || 0
    }
  } catch (error) {
    console.error("Error getting patent count:", error)
    return { isSuccess: false, message: "Failed to get patent count" }
  }
}
