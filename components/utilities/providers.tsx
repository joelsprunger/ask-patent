"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { Session } from "@supabase/supabase-js"

interface ProvidersProps {
  children: React.ReactNode
  session: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
