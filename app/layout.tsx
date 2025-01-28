import "@/app/globals.css"
import { Providers } from "@/components/utilities/providers"
import { Inter } from "next/font/google"
import { SearchProvider } from "@/lib/providers/search-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import NavBar from "@/components/nav-bar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        <AuthProvider>
          <NavBar />
          <main className="mx-auto min-h-screen max-w-screen-xl px-4 pb-20 pt-4 md:pb-4 md:pt-20">
            <SearchProvider>
              <Providers>{children}</Providers>
            </SearchProvider>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
