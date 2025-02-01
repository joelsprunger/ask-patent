"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react"
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
  incrementAnonymousAIRequests: () => number
  anonymousAIRequestCount: number
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isLoggedIn: false,
  session: null,
  user: null,
  signOut: async () => {},
  checkSession: async () => {},
  isAnonymous: false,
  anonymousRequestCount: 0,
  incrementAnonymousAIRequests: () => 0,
  anonymousAIRequestCount: 0
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [anonymousRequestCount] = useState(0)
  const [anonymousAIRequestCount, setAnonymousAIRequestCount] = useState(0)
  const MAX_ANONYMOUS_REQUESTS = 50
  const MAX_ANONYMOUS_AI_REQUESTS = 10

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) return
    setSession(null)
    setUser(null)
    setIsLoggedIn(false)
    setIsAnonymous(false)

    // Add warning message to URL if limits were reached
    const anonymousAICount = LocalStorage.getAnonymousAIRequestCount() || 0
    const anonymousCount = LocalStorage.getAnonymousRequestCount() || 0
    const isLimitReached =
      anonymousAICount >= MAX_ANONYMOUS_AI_REQUESTS ||
      anonymousCount >= MAX_ANONYMOUS_REQUESTS

    const loginPath = isLimitReached
      ? "/login?message=trial_limit_reached"
      : "/login"

    router.push(loginPath)
    router.refresh()
  }

  const incrementAnonymousAIRequests = useCallback(() => {
    if (!isAnonymous) return 0

    const currentCount = LocalStorage.incrementAnonymousAIRequests()
    setAnonymousAIRequestCount(currentCount)

    if (currentCount >= MAX_ANONYMOUS_AI_REQUESTS) {
      signOut()
    }

    return currentCount
  }, [isAnonymous])

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const hasLoggedIn = LocalStorage.getHasLoggedIn()
      const anonymousCount = LocalStorage.getAnonymousRequestCount()
      const anonymousAICount = LocalStorage.getAnonymousAIRequestCount()

      // First check if we should prevent anonymous login
      if (
        anonymousAICount >= MAX_ANONYMOUS_AI_REQUESTS ||
        anonymousCount >= MAX_ANONYMOUS_REQUESTS
      ) {
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
        setIsAnonymous(data.session?.user?.is_anonymous ?? false)
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
      if (!hasLoggedIn && anonymousCount < MAX_ANONYMOUS_REQUESTS) {
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
        anonymousRequestCount,
        incrementAnonymousAIRequests,
        anonymousAIRequestCount
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

// Create a custom hook to increment AI requests
export const useIncrementAIRequest = () => {
  const { incrementAnonymousAIRequests } = useAuth()
  return incrementAnonymousAIRequests
}
