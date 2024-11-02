"use server"

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return Array.from(cookieStore.getAll()).map(({ name, value }) => ({
            name,
            value
          }))
        },
        setAll: cookies => {
          cookies.map(({ name, value, ...options }) => {
            cookieStore.set({ name, value, ...options })
          })
        }
      }
    }
  )
}
