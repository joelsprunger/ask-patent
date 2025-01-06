export interface Patent {
  id: string
  patent_number: string
  title: string
  applicant: string | null
  patent_type: string | null
  abstract: string | null
  authors: string[] | null
  filing_date: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SearchResponse {
  success: boolean
  message: string
  data: Patent[]
}

export type PatentSection =
  | "abstract"
  | "background"
  | "summary"
  | "claims"
  | "drawings"
  | "detailed_description"
  | "full_content"
