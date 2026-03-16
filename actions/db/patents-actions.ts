"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Patent, PatentQuery, PatentSectionData, DOCUMENT_SECTION_ORDER } from "@/types/patent-types"
import { ActionState } from "@/types"

const PATENT_SELECT =
  "id, patent_number, lens_id, title, abstract, assignee, assignees, inventors, filing_date, grant_date, date_published, metadata, created_at, updated_at"

export async function getPatentByIdAction(
  id: string
): Promise<ActionState<Patent>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: patent, error } = await supabase
      .from("patents")
      .select()
      .eq("id", id)
      .single()

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patent retrieved successfully",
      data: patent
    }
  } catch (error) {
    console.error("Error getting patent:", error)
    return { isSuccess: false, message: "Failed to get patent" }
  }
}

export async function getSimilarPatentsAction(
  id: string
): Promise<ActionState<Patent[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        isSuccess: false,
        message: "Not authenticated"
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX
    if (!apiUrl || !apiPrefix) {
      throw new Error("API URL or prefix not configured")
    }

    const url = new URL(`${apiPrefix}/patents/${id}/similar`, apiUrl)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Failed to get similar patents")
    }

    const data = await response.json()

    return {
      isSuccess: true,
      message: "Similar patents retrieved successfully",
      data: data.data
    }
  } catch (error) {
    console.error("Error getting similar patents:", error)
    return { isSuccess: false, message: "Failed to get similar patents" }
  }
}

export async function getPaginatedPatentsAction(
  page: number,
  pageSize: number,
  sortBy: string = "title",
  sortOrder: "asc" | "desc" = "asc"
): Promise<ActionState<Patent[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: patents, error } = await supabase
      .from("patents")
      .select(PATENT_SELECT)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patents retrieved successfully",
      data: patents
    }
  } catch (error) {
    console.error("Error getting paginated patents:", error)
    return { isSuccess: false, message: "Failed to get paginated patents" }
  }
}

export async function getFilteredPatentsAction(
  query: PatentQuery
): Promise<ActionState<{ patents: Patent[]; nextCursor: string | null; prevCursor: string | null; totalCount: number }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { filters, sortOrder, cursor, limit, direction } = query
    const asc = direction === "backward" ? sortOrder !== "asc" : sortOrder === "asc"

    // inventors is a TEXT[] — sort and paginate on inventors[1] (first inventor)
    const sortBy = query.sortBy === "inventor" ? "inventors" : query.sortBy
    const isInventorSort = query.sortBy === "inventor"

    let patentIds: string[] | null = null

    // Full-text search via tsvector RPC — returns ranked patent IDs
    if (filters.search && filters.search.trim()) {
      const { data: searchRows, error: searchError } = await supabase.rpc(
        "search_patent_sections",
        { search_query: filters.search.trim(), section_filter: null, match_count: 500 }
      )
      if (searchError) throw searchError
      patentIds = (searchRows ?? []).map((r: { patent_id: string }) => r.patent_id)
      if (!patentIds || patentIds.length === 0) {
        return {
          isSuccess: true,
          message: "No results",
          data: { patents: [], nextCursor: null, prevCursor: null, totalCount: 0 }
        }
      }
    }

    // Resolve inventor filter to a list of IDs (unnest-based substring match)
    let inventorIds: string[] | null = null
    if (filters.inventor) {
      const { data: invRows } = await (supabase as any).rpc("search_patents_by_inventor", { inventor_query: filters.inventor })
      inventorIds = (invRows ?? []).map((r: { patent_id: string }) => r.patent_id)
      if (!inventorIds || inventorIds.length === 0) {
        return { isSuccess: true, message: "No results", data: { patents: [], nextCursor: null, prevCursor: null, totalCount: 0 } }
      }
    }

    const applyFilters = (q: any) => {
      if (patentIds) q = q.in("id", patentIds)
      if (inventorIds) q = q.in("id", inventorIds)
      if (filters.title) q = q.ilike("title", `%${filters.title}%`)
      if (filters.assignee) q = q.ilike("assignee", `%${filters.assignee}%`)
      if (filters.patent_number) q = q.ilike("patent_number", `%${filters.patent_number}%`)
      if (filters.dateRange) q = q.gte("filing_date", filters.dateRange[0]).lte("filing_date", filters.dateRange[1])
      return q
    }

    const { count: totalCount } = await applyFilters(
      (supabase as any).from("patents").select("id", { count: "exact", head: true })
    )

    let q = applyFilters(supabase.from("patents").select(PATENT_SELECT))

    // Cursor-based pagination
    if (cursor) {
      const op = asc ? "gt" : "lt"
      if (isInventorSort) {
        q = q.filter("inventors->0", op, cursor)
      } else {
        q = q.filter(sortBy, op, cursor)
      }
    }

    if (isInventorSort) {
      q = (q as any).order("inventors->0", { ascending: asc }).limit(limit + 1)
    } else {
      q = q.order(sortBy, { ascending: asc }).limit(limit + 1)
    }

    const { data: rows, error } = await q
    if (error) throw error

    const hasMore = (rows?.length ?? 0) > limit
    const patents = (rows ?? []).slice(0, limit) as Patent[]

    const getCursorVal = (p: Patent) =>
      isInventorSort
        ? (p.inventors?.[0] ?? "")
        : (p as unknown as Record<string, unknown>)[sortBy]

    const lastVal = getCursorVal(patents[patents.length - 1])
    const firstVal = getCursorVal(patents[0])

    const nextCursor =
      direction !== "backward" && hasMore ? String(lastVal ?? "") : null
    const prevCursor =
      cursor && direction !== "forward" ? String(firstVal ?? "") : null

    // When going backward the results arrive in reversed order — fix them
    if (!asc && direction === "backward") patents.reverse()

    return {
      isSuccess: true,
      message: "Patents retrieved successfully",
      data: { patents, nextCursor, prevCursor, totalCount: totalCount ?? 0 }
    }
  } catch (error) {
    console.error("Error getting filtered patents:", error)
    return { isSuccess: false, message: "Failed to get filtered patents" }
  }
}

export async function getPatentsCountAction(): Promise<ActionState<number>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from("patents")
      .select("*", { count: "exact", head: true })

    if (error) throw error

    return {
      isSuccess: true,
      message: "Patent count retrieved successfully",
      data: count || 0
    }
  } catch (error) {
    console.error("Error getting patent count:", error)
    return { isSuccess: false, message: "Failed to get patent count" }
  }
}

export async function getPatentSectionsAction(
  patentId: string
): Promise<ActionState<PatentSectionData[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await (supabase as any)
      .from("patent_sections")
      .select("section_type, content")
      .eq("patent_id", patentId)

    if (error) throw error

    const all = (data ?? []).filter((s: PatentSectionData) => s.section_type !== "ai_summary")
    const hasParsedSections = all.some(s => s.section_type !== "full_content")

    const ordered = (hasParsedSections ? all.filter(s => s.section_type !== "full_content") : all)
      .sort((a: PatentSectionData, b: PatentSectionData) => {
        const ai = DOCUMENT_SECTION_ORDER.indexOf(a.section_type)
        const bi = DOCUMENT_SECTION_ORDER.indexOf(b.section_type)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })

    return {
      isSuccess: true,
      message: "Sections retrieved successfully",
      data: ordered
    }
  } catch (error) {
    console.error("Error getting patent sections:", error)
    return { isSuccess: false, message: "Failed to get patent sections" }
  }
}

export async function getCachedSummaryAction(
  patentId: string
): Promise<ActionState<{ text: string; generated_at: string } | null>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("patents")
      .select("metadata")
      .eq("id", patentId)
      .single()

    if (error) throw error

    const meta = data?.metadata as Record<string, unknown> | null
    const cached = meta?.ai_summary as { text: string; generated_at: string } | undefined

    return {
      isSuccess: true,
      message: "Cached summary retrieved",
      data: cached ?? null
    }
  } catch (error) {
    console.error("Error getting cached summary:", error)
    return { isSuccess: false, message: "Failed to get cached summary" }
  }
}
