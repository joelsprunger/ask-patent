"use server"

import { getPatentByIdAction } from "@/actions/db/patents-actions"
import { getSimilarPatentsAction } from "@/actions/patents-actions"
import { PatentCard } from "@/components/ui/patent-card"
import { Suspense } from "react"
import { PatentSkeleton } from "./_components/patent-skeleton"
import { PatentTabs } from "./_components/patent-tabs"

interface PatentPageProps {
  params: {
    id: string
  }
}

export default async function PatentPage({ params }: PatentPageProps) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<PatentSkeleton />}>
        <PatentPageContent id={params.id} />
      </Suspense>
    </div>
  )
}

async function PatentPageContent({ id }: { id: string }) {
  const [patentResult, similarPatentsResult] = await Promise.all([
    getPatentByIdAction(id),
    getSimilarPatentsAction(id)
  ])

  if (!patentResult.isSuccess || !patentResult.data) {
    return <div>Failed to load patent details</div>
  }

  return (
    <div className="space-y-8">
      <PatentCard
        patent={patentResult.data}
        isLink={false}
        animate={false}
        index={0}
      />

      {similarPatentsResult.isSuccess && similarPatentsResult.data ? (
        <PatentTabs similarPatents={similarPatentsResult.data} patentId={id} />
      ) : (
        <div>Failed to load similar patents</div>
      )}
    </div>
  )
}
