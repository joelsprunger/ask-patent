import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // if (session) {
  //   redirect("/")
  // }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  )
}
