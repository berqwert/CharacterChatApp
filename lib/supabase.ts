import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Debug: Check if env vars are loaded
  if (!url || !key) {
    console.error('❌ Supabase env vars missing!', {
      url: url ? '✅' : '❌',
      key: key ? `✅ (${key.substring(0, 20)}...)` : '❌',
    });
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Check .env.local file.');
  }
  
  console.log('✅ Supabase client initialized with:', {
    url,
    keyPrefix: key.substring(0, 30) + '...',
  });
  
  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  return supabaseClient;
}