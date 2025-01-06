"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signUpAction } from "@/actions/auth/signup-actions"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signUpAction({
      email,
      password,
      redirectTo: `${window.location.origin}/auth/callback`
    })

    if (!result.isSuccess) {
      setError(result.message)
      setLoading(false)
      return
    }

    // Show success message
    setError(result.message)
    setLoading(false)
  }

  return (
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

      {error && (
        <p
          className={`text-sm ${
            error.includes("Check") ? "text-green-500" : "text-red-500"
          }`}
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : "Sign Up"}
      </Button>
    </form>
  )
}
