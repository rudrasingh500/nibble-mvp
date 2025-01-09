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
      vendors: {
        Row: {
          id: string
          name: string
          description: string
          image: string
          rating: number
          cuisine: string
          lat: number
          lng: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image: string
          rating?: number
          cuisine: string
          lat: number
          lng: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image?: string
          rating?: number
          cuisine?: string
          lat?: number
          lng?: number
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}