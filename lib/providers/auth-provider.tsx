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
    console.log("signing out: setting IsLoggedIn to false")
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

      const isAnonymousLimitReached =
        anonymousAICount >= MAX_ANONYMOUS_AI_REQUESTS ||
        anonymousCount >= MAX_ANONYMOUS_REQUESTS

      // Set states immediately based on session
      if (data.session) {
        const isAnon = Boolean(data.session?.user?.is_anonymous)

        // Update all related states atomically
        setSession(data.session)
        setUser(data.session.user)
        setIsLoggedIn(true)
        setIsAnonymous(isAnon)

        if (isAnon && isAnonymousLimitReached) {
          await signOut()
          return
        }

        if (isAnon) {
          LocalStorage.incrementAnonymousRequests()
        }

        return
      }

      // Only attempt anonymous login if no previous login and limits not reached
      if (!hasLoggedIn && !isAnonymousLimitReached) {
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

      // Clear states if no session
      setSession(null)
      setUser(null)
      console.log("No session: setting IsLoggedIn to false")
      setIsLoggedIn(false)
      setIsAnonymous(false)
      const loginPath = "/login"

      router.push(loginPath)
      router.refresh()
    } catch (error) {
      console.error("Error checking session:", error)
      // Reset states on error
      setSession(null)
      setUser(null)
      console.log("Error is being handled: setting IsLoggedIn to false")
      setIsLoggedIn(false)
      setIsAnonymous(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Check session on mount and pathname changes
  useEffect(() => {
    checkSession()
  }, [pathname])

  // Modify the auth subscription to be more explicit
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        const isAnon = Boolean(session?.user?.is_anonymous)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoggedIn(true)
        setIsAnonymous(isAnon)
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        console.log("Signed out event: setting IsLoggedIn to false")
        setIsLoggedIn(false)
        setIsAnonymous(false)
      }
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

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
