import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if we have valid credentials and it's not the placeholder
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && supabaseUrl !== 'https://placeholder.supabase.co'
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'placeholder-key'

export const supabase = isValidUrl && isValidKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      meetings: {
        Row: {
          id: string
          title: string
          content: string
          summary: any
          user_id: string
          created_at: string
          updated_at: string
          file_name: string | null
          file_type: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary: any
          user_id: string
          created_at?: string
          updated_at?: string
          file_name?: string | null
          file_type?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: any
          user_id?: string
          created_at?: string
          updated_at?: string
          file_name?: string | null
          file_type?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
  }
}