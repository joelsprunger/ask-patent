"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import SignUpForm from "./_components/signup-form"

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-gray-500">Enter your email to create your account</p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Login <ArrowRight className="inline h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
