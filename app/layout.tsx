import "@/app/globals.css"
import { Providers } from "@/components/utilities/providers"
import { Inter } from "next/font/google"

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
