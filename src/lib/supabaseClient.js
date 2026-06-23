import { createClient } from '@supabase/supabase-js'

export function createSupabaseBrowserClient({
  anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY,
  url = import.meta.env.VITE_SUPABASE_URL,
} = {}) {
  if (!url || !anonKey) {
    return null
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

export const supabase = createSupabaseBrowserClient()
export const isSupabaseConfigured = Boolean(supabase)

