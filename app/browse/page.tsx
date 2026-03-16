"use server"

import { Suspense } from "react"
import BrowsePatents from "@/app/browse/_components/browse-patents"
import { BrowseSkeleton } from "@/app/browse/_components/browse-skeleton"

export default async function BrowsePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse Patents</h1>

      <Suspense fallback={<BrowseSkeleton />}>
        <BrowsePatents />
      </Suspense>
    </div>
  )
}
