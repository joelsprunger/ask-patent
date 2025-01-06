"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

interface LoginData {
  email: string
  password: string
}

export async function loginAction(data: LoginData): Promise<ActionState<null>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (signInError) {
      return {
        isSuccess: false,
        message: signInError.message
      }
    }

    revalidatePath("/", "layout")
    return {
      isSuccess: true,
      message: "Logged in successfully"
    }
    
  } catch (err) {
    console.error("Login error:", err)
    return {
      isSuccess: false,
      message: "An unexpected error occurred during login"
    }
  }
}
