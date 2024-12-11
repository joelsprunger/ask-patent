"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Patent } from "@/types/patents-types"
import { RelatedPatentsTab } from "./tabs/related-patents-tab"
import { SummaryTab } from "./tabs/summary-tab"
import { AskPatentTab } from "./tabs/ask-patent-tab"

interface PatentTabsProps {
  similarPatents: Patent[]
  patentId: string
}

export function PatentTabs({ similarPatents, patentId }: PatentTabsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Patent Tools</h2>

      <Tabs defaultValue="related" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="ask">Ask Patent</TabsTrigger>
        </TabsList>

        <TabsContent value="related">
          <RelatedPatentsTab similarPatents={similarPatents} />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryTab patentId={patentId} />
        </TabsContent>

        <TabsContent value="ask">
          <AskPatentTab patentId={patentId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
