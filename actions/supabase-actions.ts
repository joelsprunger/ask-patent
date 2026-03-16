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
    const { data, error } = await (supabase as any)
      .from("patent_sections")
      .select("content")
      .eq("patent_id", patentId)
      .eq("section_type", section)
      .single()

    if (error || !data) return ""
    return data.content || ""
  } catch (error) {
    console.error("Error fetching patent section:", error)
    return ""
  }
}
