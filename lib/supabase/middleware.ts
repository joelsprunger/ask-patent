import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create initial response
  let response = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // If environment variables are missing, skip auth check
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not available')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            })
          },
        },
      }
    )

    // IMPORTANT: Get user before any other actions
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow access to public routes even when not authenticated
    const publicRoutes = ['/login', '/auth', '/', '/about']
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If user is not signed in and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)
    return response
  }
} 