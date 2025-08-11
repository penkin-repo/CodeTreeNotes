export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          parent_id: string | null
          title: string
          code: string
          comment: string
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          title: string
          code: string
          comment: string
          language: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          title?: string
          code?: string
          comment?: string
          language?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
