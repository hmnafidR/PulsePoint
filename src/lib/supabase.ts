import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Database types
export type User = {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Meeting = {
  id: string
  title: string
  date: string
  participants: string[]
  transcript: string
  sentiment_analysis: {
    overall_sentiment: string
    participant_sentiments: Record<string, string>
    engagement_levels: Record<string, number>
  }
  meeting_link: string
  created_by: string
  created_at: string
  updated_at: string
} 