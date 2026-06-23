import { createClient } from '@supabase/supabase-js'

const supabaseEnvKeys = {
  anonKey: 'VITE_SUPABASE_ANON_KEY',
  url: 'VITE_SUPABASE_URL',
}

const placeholderPatterns = [
  /^your_/i,
  /^your-/i,
  /^your\s/i,
  /^<.+>$/,
  /^\[.+\]$/,
  /your-project/i,
  /your-supabase/i,
  /supabase-url/i,
  /supabase-anon-key/i,
  /anon-key/i,
  /project-url/i,
  /paste/i,
  /placeholder/i,
]

export function createSupabaseBrowserClient({
  anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY,
  url = import.meta.env.VITE_SUPABASE_URL,
} = {}) {
  const normalizedUrl = normalizeEnvValue(url)
  const normalizedAnonKey = normalizeEnvValue(anonKey)
  const configStatus = getSupabaseConfigStatus({ anonKey, url })

  if (!configStatus.isConfigured) {
    return null
  }

  return createClient(normalizedUrl, normalizedAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

export function getSupabaseConfigStatus({
  anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY,
  url = import.meta.env.VITE_SUPABASE_URL,
} = {}) {
  const normalizedUrl = normalizeEnvValue(url)
  const normalizedAnonKey = normalizeEnvValue(anonKey)
  const missingKeys = []

  if (isMissingOrPlaceholderValue(normalizedUrl)) {
    missingKeys.push(supabaseEnvKeys.url)
  }

  if (isMissingOrPlaceholderValue(normalizedAnonKey)) {
    missingKeys.push(supabaseEnvKeys.anonKey)
  }

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
  }
}

export const supabase = createSupabaseBrowserClient()
export const isSupabaseConfigured = Boolean(supabase)
export const supabaseConfigStatus = getSupabaseConfigStatus()

function normalizeEnvValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isMissingOrPlaceholderValue(value) {
  if (!value) {
    return true
  }

  return placeholderPatterns.some((pattern) => pattern.test(value))
}
