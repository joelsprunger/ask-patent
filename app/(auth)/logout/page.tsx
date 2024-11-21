"use server"

import { logoutAction } from "@/actions/auth/logout-actions"
import { redirect } from "next/navigation"

export default async function LogoutPage() {
  const result = await logoutAction()

  if (result.isSuccess) {
    redirect("/login")
  }

  // If logout failed, redirect to home
  redirect("/")
}
