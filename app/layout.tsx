import "@/app/globals.css"
import { Providers } from "@/components/utilities/providers"
import { Inter } from "next/font/google"
import { SearchProvider } from "@/lib/providers/search-provider"

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
        <SearchProvider>
          <Providers>{children}</Providers>
        </SearchProvider>
      </body>
    </html>
  )
}
