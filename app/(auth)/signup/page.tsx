"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage("Check your email for the confirmation link")
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-gray-500">Enter your email to create your account</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-500">{message}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Sign Up"}
        </Button>
      </form>

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
