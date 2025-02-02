"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { Session } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { LocalStorage } from "@/lib/local-storage"

interface LoginData {
  email: string
  password: string
}

export async function loginAction(
  data: LoginData
): Promise<ActionState<{ session: Session | null }>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
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
      message: "Logged in successfully",
      data: {
        session: authData.session
      }
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: "An unexpected error occurred"
    }
  }
}
