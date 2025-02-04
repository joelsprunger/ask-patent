"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowRight, AlertTriangle } from "lucide-react"
import Link from "next/link"
import LoginForm from "./_components/login-form"

export default async function LoginPage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  console.log("user", user)

  const anonUser = user?.is_anonymous ?? false
  console.log("anonUser", anonUser)
  if (user && !anonUser) {
    console.log("user here", user)
    console.log("redirecting to home")
    redirect("/")
  }

  const showLimitWarning = searchParams.message === "trial_limit_reached"

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>

      {showLimitWarning && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-600/50 bg-yellow-600/10 p-3 text-sm text-yellow-600 dark:border-yellow-500/50 dark:bg-yellow-500/10 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          <p>
            You&apos;ve reached the trial usage limit. Please sign in or create
            an account to continue.
          </p>
        </div>
      )}

      <LoginForm />

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Sign up <ArrowRight className="inline h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
