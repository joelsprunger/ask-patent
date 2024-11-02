"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

interface SignUpData {
  email: string
  password: string
  redirectTo: string
}

export async function signUpAction(
  data: SignUpData
): Promise<ActionState<null>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: data.redirectTo
      }
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
      message: "Check your email for the confirmation link"
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: "An unexpected error occurred"
    }
  }
}
