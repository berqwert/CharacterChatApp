import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    // In this starter, we silently return a client placeholder to avoid runtime crashes.
    // Replace with proper error handling in production.
    return createClient('https://example.supabase.co', 'public-anon-key', { auth: { persistSession: false } })
  }
  return createClient(url, anon)
}


