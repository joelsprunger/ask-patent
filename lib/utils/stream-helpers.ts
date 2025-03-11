"use client"

import { supabase } from "@/lib/supabase/client"

// Define interfaces for the request body types
export interface ChatRequestBody {
  patent_id: string
  query: string
  thread_id: string
}

// Generic request body type that can be extended for different endpoints
export type ApiRequestBody = ChatRequestBody | Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function streamFromApi<T>({
  url,
  method = "GET",
  body,
  onChunk,
  onComplete,
  onError
}: {
  url: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: ApiRequestBody
  onChunk: (chunk: string) => void
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
}): Promise<void> {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session) {
      throw new Error("Not authenticated")
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      onChunk(chunk)
    }

    if (onComplete) {
      onComplete(fullResponse)
    }
  } catch (error) {
    console.error("Stream error:", error)
    if (onError && error instanceof Error) {
      onError(error)
    }
  }
}
