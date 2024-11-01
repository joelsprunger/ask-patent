"use server"

import { createClient } from "@/utils/supabase/server"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
})

export const metadata: Metadata = {
  title: "Ask Patent",
  description: "AI powered patent search and exploration"
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          supabase={supabase}
          session={session}
        >
          {children}

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
