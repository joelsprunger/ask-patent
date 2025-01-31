"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { LocalStorage } from "@/lib/local-storage"

interface AuthContextType {
  isLoading: boolean
  isLoggedIn: boolean
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
  isAnonymous: boolean
  anonymousRequestCount: number
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isLoggedIn: false,
  session: null,
  user: null,
  signOut: async () => {},
  checkSession: async () => {},
  isAnonymous: false,
  anonymousRequestCount: 0
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [anonymousRequestCount, setAnonymousRequestCount] = useState(0)
  const MAX_ANONYMOUS_REQUESTS = 5

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const hasLoggedIn = LocalStorage.getHasLoggedIn()
      const anonymousCount = LocalStorage.getAnonymousRequestCount()

      // Check if current route is public
      const publicRoutes = ["/login", "/signup", "/about"]
      const isPublicRoute =
        pathname === "/" ||
        publicRoutes.some(route => pathname.startsWith(route))

      // First check if we should prevent anonymous login
      if (anonymousCount >= MAX_ANONYMOUS_REQUESTS) {
        // If there's a session and it's anonymous, sign out
        if (data.session?.user?.is_anonymous) {
          await signOut()
        }
        setSession(null)
        setUser(null)
        setIsLoggedIn(false)
        setIsAnonymous(false)
        return
      }

      // If we have a session, update state
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        setIsLoggedIn(true)
        setIsAnonymous(!!data.session.user?.is_anonymous)

        // Track anonymous requests if needed
        if (data.session.user?.is_anonymous) {
          const count = LocalStorage.incrementAnonymousRequests()
          if (count >= MAX_ANONYMOUS_REQUESTS) {
            await signOut()
            return
          }
        }
        return
      }

      // Only try anonymous login if:
      // 1. No session
      // 2. Never logged in
      // 3. Under request limit
      // 4. Not on a public route
      if (
        !hasLoggedIn &&
        anonymousCount < MAX_ANONYMOUS_REQUESTS &&
        !isPublicRoute
      ) {
        const { data: anonData, error: anonError } =
          await supabase.auth.signInAnonymously()
        if (!anonError && anonData.session) {
          setSession(anonData.session)
          setUser(anonData.session.user)
          setIsLoggedIn(true)
          setIsAnonymous(true)
          LocalStorage.incrementAnonymousRequests()
          return
        }
      }

      // If we get here, no session was established
      setSession(null)
      setUser(null)
      setIsLoggedIn(false)
      setIsAnonymous(false)
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
    if (error) return

    setSession(null)
    setUser(null)
    setIsLoggedIn(false)
    setIsAnonymous(false)

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
        checkSession,
        isAnonymous,
        anonymousRequestCount
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
