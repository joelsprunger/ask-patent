"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/")
      }
    }

    checkUser()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  )
}
