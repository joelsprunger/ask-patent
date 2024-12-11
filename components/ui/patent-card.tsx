"use client"

import { Patent } from "@/types/patent-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { motion } from "framer-motion"

interface PatentCardProps {
  patent: Patent
  isLink?: boolean
  index?: number
  animate?: boolean
}

export function PatentCard({
  patent,
  isLink = true,
  index = 0,
  animate = true
}: PatentCardProps) {
  const authorString = patent.authors
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\((.*?)\)/g, "")

  const content = (
    <Card className="w-full mb-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm text-zinc-400">
              Patent #{patent.patent_number}
            </CardTitle>
          </div>

          <h2 className="text-xl font-semibold text-zinc-100 group-hover:text-blue-500">
            {patent.title}
          </h2>

          <div className="text-sm text-zinc-400">{authorString}</div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-zinc-300 leading-relaxed">{patent.abstract}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  )

  const animatedWrapper = (children: React.ReactNode) => {
    if (!animate) return children

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          delay: index * 0.1
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        {children}
      </motion.div>
    )
  }

  if (isLink) {
    return animatedWrapper(
      <Link href={`/patents/${patent.id}`} className="block group">
        {content}
      </Link>
    )
  }

  return animatedWrapper(content)
}
