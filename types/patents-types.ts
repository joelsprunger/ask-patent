export interface Patent {
  id: string
  title: string
  abstract: string
  patent_number: string
  authors: string[]
  inventors?: string[]
  assignee?: string
  filing_date?: string | null
  publication_date?: string
  patent_type?: string
  applicant?: string
  created_at: string
  updated_at: string
}
