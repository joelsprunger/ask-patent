"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Patent, PatentQuery } from "@/types/patent-types"
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
    const { filters, sortBy, sortOrder, cursor, limit, direction } = query
    const asc = direction === "backward" ? sortOrder !== "asc" : sortOrder === "asc"

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

    // Count query with same filters but no cursor/limit
    let countQ = (supabase as any).from("patents").select("id", { count: "exact", head: true })
    if (patentIds) countQ = countQ.in("id", patentIds)
    if (filters.assignee) countQ = countQ.ilike("assignee", `%${filters.assignee}%`)
    if (filters.patentNumber) countQ = countQ.ilike("patent_number", `%${filters.patentNumber}%`)
    if (filters.inventor) countQ = countQ.contains("inventors", [filters.inventor])
    if (filters.dateRange) {
      countQ = countQ.gte("filing_date", filters.dateRange[0]).lte("filing_date", filters.dateRange[1])
    }
    const { count: totalCount } = await countQ

    let q = supabase.from("patents").select(PATENT_SELECT)

    if (patentIds) q = q.in("id", patentIds)
    if (filters.assignee) q = q.ilike("assignee", `%${filters.assignee}%`)
    if (filters.patentNumber) q = q.ilike("patent_number", `%${filters.patentNumber}%`)
    if (filters.inventor) q = q.contains("inventors", [filters.inventor])
    if (filters.dateRange) {
      q = q.gte("filing_date", filters.dateRange[0]).lte("filing_date", filters.dateRange[1])
    }

    // Cursor-based pagination
    if (cursor) {
      const op = asc ? "gt" : "lt"
      q = q.filter(sortBy, op, cursor)
    }

    q = q.order(sortBy, { ascending: asc }).limit(limit + 1)

    const { data: rows, error } = await q
    if (error) throw error

    const hasMore = (rows?.length ?? 0) > limit
    const patents = (rows ?? []).slice(0, limit) as Patent[]

    const lastVal = (patents[patents.length - 1] as unknown as Record<string, unknown>)[sortBy]
    const firstVal = (patents[0] as unknown as Record<string, unknown>)[sortBy]

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
