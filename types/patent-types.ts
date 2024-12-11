export interface Patent {
  id: string
  patent_number: string
  title: string
  applicant: string
  patent_type: string
  abstract: string
  authors: string[]
  filing_date: string | null
  created_at: string
  updated_at: string
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
