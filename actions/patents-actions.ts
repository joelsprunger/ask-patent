"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { Patent } from "@/types"
import { PatentSection } from "@/types/patent-types"

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

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(
        `Failed to get similar patents: ${
          responseData.message || "Unknown error"
        }`
      )
    }

    return {
      isSuccess: true,
      message: "Similar patents retrieved successfully",
      data: responseData.data
    }
  } catch (error) {
    console.error("[Similar Patents] Error:", error)
    return { isSuccess: false, message: "Failed to get similar patents" }
  }
}

export async function getPatentSummaryAction(
  id: string,
  section: PatentSection = "summary"
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
    if (!apiUrl) {
      throw new Error("API URL not configured")
    }

    const url = new URL(`/patents/${id}/summarize`, apiUrl)
    url.searchParams.append("section", section)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to get summary")
    }

    return {
      isSuccess: true,
      message: "Summary retrieved successfully",
      data: data.data.summary
    }
  } catch (error) {
    console.error("[Patent Summary] Error:", error)
    return { isSuccess: false, message: "Failed to get summary" }
  }
}

export async function askPatentQuestionAction(
  patentId: string,
  question: string,
  k: number = 5
): Promise<ActionState<{ answer: string }>> {
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

    const url = new URL(`/patents/${patentId}/ask`, apiUrl)
    url.searchParams.append("question", question)
    url.searchParams.append("k", k.toString())

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to get answer")
    }

    const data = await response.json()

    return {
      isSuccess: true,
      message: "Question answered successfully",
      data: {
        answer: data.data.answer
      }
    }
  } catch (error) {
    console.error("Error asking question:", error)
    return { isSuccess: false, message: "Failed to get answer" }
  }
}

export async function getSuggestedQuestionsAction(
  patentId: string,
  n: number = 3,
  section: PatentSection = "summary"
): Promise<ActionState<string[]>> {
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

    const url = new URL(`/patents/${patentId}/suggest_questions`, apiUrl)
    url.searchParams.append("n", n.toString())
    url.searchParams.append("section", section)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to get suggested questions")
    }

    const data = await response.json()
    return {
      isSuccess: true,
      message: "Questions suggested successfully",
      data: data.data.questions.questions
    }
  } catch (error) {
    console.error("Error getting suggested questions:", error)
    return {
      isSuccess: false,
      message: "Failed to get suggested questions",
      data: [
        "What are the key innovations in this patent?",
        "How does this compare to existing patents?",
        "What are the potential applications of this technology?"
      ]
    }
  }
}

interface ChatResponse {
  response: string
  thread_id: string
  patent_id: string
}

export async function chatWithPatentAgentAction(
  patentId: string,
  query: string,
  threadId: string
): Promise<ActionState<ChatResponse>> {
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

    const url = new URL("/patent-agent/chat", apiUrl)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        patent_id: patentId,
        query: query,
        thread_id: threadId
      })
    })

    if (!response.ok) {
      throw new Error("Failed to get chat response")
    }

    const data = await response.json()

    return {
      isSuccess: true,
      message: "Chat response received successfully",
      data: data.data
    }
  } catch (error) {
    console.error("Error chatting with patent agent:", error)
    return { isSuccess: false, message: "Failed to get chat response" }
  }
}

export async function deleteThreadAction(
  threadId: string
): Promise<ActionState<void>> {
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

    const url = new URL(`/patent-agent/thread/${threadId}`, apiUrl)

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to delete thread")
    }

    return {
      isSuccess: true,
      message: "Thread deleted successfully"
    }
  } catch (error) {
    console.error("Error deleting thread:", error)
    return { isSuccess: false, message: "Failed to delete thread" }
  }
}
