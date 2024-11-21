"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

export async function logoutAction(): Promise<ActionState<null>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        isSuccess: false,
        message: error.message
      }
    }

    revalidatePath("/", "layout")
    return {
      isSuccess: true,
      message: "Logged out successfully"
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: "An unexpected error occurred"
    }
  }
}
