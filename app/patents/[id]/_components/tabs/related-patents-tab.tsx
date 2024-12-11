"use client"

import { PatentCard } from "@/components/ui/patent-card"
import { Patent } from "@/types/patents-types"

interface RelatedPatentsTabProps {
  similarPatents: Patent[]
}

export function RelatedPatentsTab({ similarPatents }: RelatedPatentsTabProps) {
  return (
    <div className="grid gap-4">
      {similarPatents.map(patent => (
        <PatentCard
          key={patent.id}
          patent={patent}
          isLink={true}
          animate={true}
        />
      ))}
    </div>
  )
}
