"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Compass, LogIn, LogOut, Search } from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { useSearch } from "@/lib/providers/search-provider"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, signOut, isAnonymous, isLoading } = useAuth()
  const [searchInput, setSearchInput] = useState("")
  const { setSearchQuery } = useSearch()

  if (isLoading) {
    return null
  }

  const links = [
    {
      name: "Browse",
      href: "/browse",
      icon: Compass
    }
  ]

  const getAuthButton = () => {
    if (isLoggedIn && isAnonymous) {
      return {
        text: "Login",
        icon: LogIn,
        action: () => router.push("/login")
      }
    }

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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      const query = searchInput.trim()
      setSearchQuery(query)
      setSearchInput("")
      router.push("/search")
    }
  }

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      const query = searchInput.trim()
      setSearchQuery(query)
      setSearchInput("")
      router.push("/search")
    }
  }

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

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="border rounded px-2 py-1"
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleSearchClick}
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={authButton.action}
          >
            <authButton.icon className="h-5 w-5" />
            <span className="hidden md:inline">{authButton.text}</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
