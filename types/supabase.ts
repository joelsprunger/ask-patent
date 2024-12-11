export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patent_background: {
        Row: {
          content: string
          created_at: string | null
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_background_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: true
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_bm25_indexes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          idf_values: Json
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          tokens: string[]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          idf_values: Json
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          tokens: string[]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          idf_values?: Json
          patent_id?: string
          section?: Database["public"]["Enums"]["patent_section_type"]
          tokens?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_bm25_indexes_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_claims: {
        Row: {
          claim_number: number
          content: string
          created_at: string | null
          id: string
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          claim_number: number
          content: string
          created_at?: string | null
          id?: string
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          claim_number?: number
          content?: string
          created_at?: string | null
          id?: string
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_claims_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_detailed_description: {
        Row: {
          content: string
          created_at: string | null
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_detailed_description_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: true
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_drawings: {
        Row: {
          content: string
          created_at: string | null
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_drawings_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: true
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_full_content: {
        Row: {
          content: string
          created_at: string | null
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_full_content_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: true
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_summary: {
        Row: {
          content: string
          created_at: string | null
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_summary_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: true
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_vectors: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          patent_id?: string
          section?: Database["public"]["Enums"]["patent_section_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_vectors_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patents: {
        Row: {
          abstract: string | null
          applicant: string | null
          authors: string[] | null
          created_at: string | null
          filing_date: string | null
          id: string
          patent_number: string
          patent_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          applicant?: string | null
          authors?: string[] | null
          created_at?: string | null
          filing_date?: string | null
          id?: string
          patent_number: string
          patent_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          applicant?: string | null
          authors?: string[] | null
          created_at?: string | null
          filing_date?: string | null
          id?: string
          patent_number?: string
          patent_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_patent_vectors: {
        Args: {
          query_embedding: string
          match_count: number
          section_filter?: Database["public"]["Enums"]["patent_section_type"]
        }
        Returns: {
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          content: string
          similarity: number
        }[]
      }
      match_patent_vectors_within_patent: {
        Args: {
          query_embedding: string
          patent_id_filter: string
          match_count: number
          section_filter?: Database["public"]["Enums"]["patent_section_type"]
        }
        Returns: {
          patent_id: string
          section: Database["public"]["Enums"]["patent_section_type"]
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      patent_section_type:
        | "abstract"
        | "background"
        | "summary"
        | "claims"
        | "drawings"
        | "detailed_description"
        | "full_content"
        | "metadata"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never