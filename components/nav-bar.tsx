"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Compass, LogIn, LogOut } from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, signOut } = useAuth()

  const links = [
    {
      name: "Search",
      href: "/search",
      icon: Compass
    }
  ]

  const getAuthButton = () => {
    if (isLoggedIn) {
      return {
        text: "Logout",
        icon: LogOut,
        action: signOut
      }
    }

    if (pathname === "/login") {
      return {
        text: "Register",
        icon: LogIn,
        action: () => router.push("/signup")
      }
    }

    if (pathname === "/signup") {
      return {
        text: "Login",
        icon: LogIn,
        action: () => router.push("/login")
      }
    }

    return {
      text: "Login",
      icon: LogIn,
      action: () => router.push("/login")
    }
  }

  const authButton = getAuthButton()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm p-4 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {links.map(link => {
              const Icon = link.icon
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 md:flex-row",
                    pathname === link.href && "text-primary"
                  )}
                  asChild
                >
                  <Link href={link.href}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs md:text-sm">{link.name}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={authButton.action}
        >
          <authButton.icon className="h-5 w-5" />
          <span className="hidden md:inline">{authButton.text}</span>
        </Button>
      </div>
    </nav>
  )
}
