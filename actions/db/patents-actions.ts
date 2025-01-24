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
    if (!apiUrl) {
      throw new Error("API URL not configured")
    }

    const url = new URL(`/patents/${id}/similar`, apiUrl)

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


