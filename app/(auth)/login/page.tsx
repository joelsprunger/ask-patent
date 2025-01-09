"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import LoginForm from "./_components/login-form"

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>

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
