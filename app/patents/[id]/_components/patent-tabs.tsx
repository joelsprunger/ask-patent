"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Patent } from "@/types/patents-types"
import { RelatedPatentsTab } from "./tabs/related-patents-tab"
import { DocumentTab } from "./tabs/document-tab"
import { AskPatentTab } from "./tabs/ask-patent-tab"

interface PatentTabsProps {
  similarPatents: Patent[]
  patentId: string
}

export function PatentTabs({ similarPatents, patentId }: PatentTabsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Patent Tools</h2>

      <Tabs defaultValue="document" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="document">Content</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="ask">Ask Patent</TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <DocumentTab patentId={patentId} />
        </TabsContent>

        <TabsContent value="related">
          <RelatedPatentsTab similarPatents={similarPatents} />
        </TabsContent>

        <TabsContent value="ask">
          <AskPatentTab patentId={patentId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
