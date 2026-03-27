export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          national_id: string | null
          district: string | null
          address: string | null
          role: 'citizen' | 'agent' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      complaints: {
        Row: {
          id: string
          reference_number: string
          user_id: string | null
          complainant_name: string
          phone: string
          email: string | null
          national_id: string | null
          district: string | null
          address: string | null
          operator: string
          category: string
          description: string
          date_started: string
          account_number: string | null
          prior_contact: string | null
          resolution_sought: string | null
          status: 'submitted' | 'acknowledged' | 'investigating' | 'resolved' | 'closed'
          assigned_to: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          internal_notes: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['complaints']['Row'], 'id' | 'reference_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>
      }
      complaint_attachments: {
        Row: {
          id: string
          complaint_id: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          uploaded_at: string
        }
        Insert: Omit<Database['public']['Tables']['complaint_attachments']['Row'], 'id' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['complaint_attachments']['Insert']>
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          agent_id: string | null
          status: 'queued' | 'active' | 'closed' | 'abandoned'
          queue_position: number | null
          session_type: 'live' | 'ai'
          started_at: string
          connected_at: string | null
          ended_at: string | null
          rating: number | null
          feedback: string | null
        }
        Insert: Omit<Database['public']['Tables']['chat_sessions']['Row'], 'id' | 'started_at'>
        Update: Partial<Database['public']['Tables']['chat_sessions']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender_id: string | null
          role: 'user' | 'agent' | 'ai' | 'system'
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      kb_categories: {
        Row: {
          id: string
          slug: string
          icon: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kb_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kb_categories']['Insert']>
      }
      kb_articles: {
        Row: {
          id: string
          category_id: string
          slug: string
          title: string
          body: string
          tags: string[]
          source_ref: string | null
          published: boolean
          view_count: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['kb_articles']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'>
        Update: Partial<Database['public']['Tables']['kb_articles']['Insert']>
      }
    }
  }
}
