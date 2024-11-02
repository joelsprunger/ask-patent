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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      return {
        isSuccess: false,
        message: error.message
      }
    }

    revalidatePath("/", "layout")
    return {
      isSuccess: true,
      message: "Logged in successfully"
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: "An unexpected error occurred"
    }
  }
}
