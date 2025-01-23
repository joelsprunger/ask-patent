"use server"

import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"
import { PatentSection } from "@/types/patent-types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getPatentSection(patentId: string, section: PatentSection) {
  try {
    let query
    switch (section) {
      case "abstract":
        const { data: patent } = await supabase
          .from("patents")
          .select("abstract")
          .eq("id", patentId)
          .single()
        return patent?.abstract || ""
      case "background":
        query = await supabase
          .from("patent_background")
          .select("content")
          .eq("patent_id", patentId)
          .single()
        return query.data?.content || ""
      case "summary":
        query = await supabase
          .from("patent_summary")
          .select("content")
          .eq("patent_id", patentId)
          .single()
        return query.data?.content || ""
      case "claims":
        query = await supabase
          .from("patent_claims")
          .select("content, claim_number")
          .eq("patent_id", patentId)
          .order("claim_number")
        
        if (!query.data) return ""
        
        return query.data
          .map(claim => `## Claim ${claim.claim_number}\n\n${claim.content}`)
          .join("\n\n")
      case "drawings":
        query = await supabase
          .from("patent_drawings")
          .select("content")
          .eq("patent_id", patentId)
          .single()
        return query.data?.content || ""
      case "detailed_description":
        query = await supabase
          .from("patent_detailed_description")
          .select("content")
          .eq("patent_id", patentId)
          .single()
        return query.data?.content || ""
      case "full_content":
        query = await supabase
          .from("patent_full_content")
          .select("content")
          .eq("patent_id", patentId)
          .single()
        return query.data?.content || ""
      default:
        return ""
    }
  } catch (error) {
    console.error("Error fetching patent section:", error)
    return ""
  }
} 