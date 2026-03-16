export interface Patent {
  id: string
  patent_number: string
  lens_id: string | null
  title: string
  abstract: string | null
  assignee: string | null
  assignees: string[] | null
  inventors: string[] | null
  filing_date: string | null
  grant_date: string | null
  date_published: string | null
  metadata: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
}

export interface SearchResponse {
  success: boolean
  message: string
  data: Patent[]
}

export interface PatentFilter {
  search?: string
  assignee?: string
  inventor?: string
  dateRange?: [string, string]
  patentNumber?: string
}

export interface PatentQuery {
  filters: PatentFilter
  sortBy: string
  sortOrder: "asc" | "desc"
  cursor?: string
  limit: number
  direction: "forward" | "backward"
}

export type PatentSection =
  | "abstract"
  | "background"
  | "summary"
  | "claims"
  | "drawings"
  | "detailed_description"
  | "full_content"
