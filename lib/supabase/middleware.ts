import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Create initial response
  const response = NextResponse.next({
    request
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // If environment variables are missing, skip auth check
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not available")
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options
            })
          })
        }
      }
    })

    // Get user before any other actions
    const {
      data: { user }
    } = await supabase.auth.getUser()

    // Define public routes
    const publicRoutes = ["/login", "/signup", "/about"]
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    )

    // Check if anonymous limits are reached from cookie
    const isLimitReached =
      request.cookies.get("isAnonymousLimitReached")?.value === "true"

    // If on login page and not limit reached, allow access
    if (request.nextUrl.pathname === "/login" && !isLimitReached) {
      return response
    }

    // If not logged in and not on a public route
    if (!user && !isPublicRoute) {
      // If limits reached, redirect to login
      if (isLimitReached) {
        const redirectUrl = new URL(
          "/login?message=trial_limit_reached",
          request.url
        )
        return NextResponse.redirect(redirectUrl)
      }

      // Otherwise, allow access (anonymous auth will happen client-side)
      return response
    }

    return response
  } catch (e) {
    console.error("Middleware error:", e)
    return response
  }
}
