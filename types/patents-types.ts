export interface Patent {
  id: string
  title: string
  abstract: string | null
  patent_number: string
  authors: string[] | null
  inventors?: string[] | null
  assignee?: string | null
  filing_date: string | null
  publication_date?: string | null
  patent_type: string | null
  applicant: string | null
  created_at: string | null
  updated_at: string | null
}
