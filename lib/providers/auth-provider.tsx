"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"

interface AuthContextType {
  isLoading: boolean
  isLoggedIn: boolean
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isLoggedIn: false,
  session: null,
  user: null,
  signOut: async () => {},
  checkSession: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoggedIn(!!data.session)
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check session on mount and pathname changes
  useEffect(() => {
    checkSession()
  }, [pathname])

  // Set up auth subscription
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async event => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkSession()
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setIsLoggedIn(false)
      }

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Poll for session changes every 5 seconds when not logged in
  useEffect(() => {
    if (isLoggedIn) return

    const interval = setInterval(checkSession, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [isLoggedIn])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return
    }
    setSession(null)
    setUser(null)
    setIsLoggedIn(false)

    // Navigate to login page before refreshing
    router.push("/login")
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        session,
        user,
        signOut,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
