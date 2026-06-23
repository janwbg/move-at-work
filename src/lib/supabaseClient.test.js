import { describe, expect, it } from 'vitest'
import {
  createSupabaseBrowserClient,
  getSupabaseConfigStatus,
} from './supabaseClient.js'

describe('supabaseClient', () => {
  it('does not crash when both env variables are missing', () => {
    const status = getSupabaseConfigStatus({
      anonKey: '',
      url: '',
    })

    expect(status).toEqual({
      isConfigured: false,
      missingKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    })
    expect(
      createSupabaseBrowserClient({
        anonKey: '',
        url: '',
      }),
    ).toBeNull()
  })

  it('reports a missing URL only', () => {
    expect(
      getSupabaseConfigStatus({
        anonKey: 'configured-anon-token',
        url: '   ',
      }),
    ).toEqual({
      isConfigured: false,
      missingKeys: ['VITE_SUPABASE_URL'],
    })
  })

  it('reports a missing anon key only', () => {
    expect(
      getSupabaseConfigStatus({
        anonKey: '',
        url: 'https://example.supabase.co',
      }),
    ).toEqual({
      isConfigured: false,
      missingKeys: ['VITE_SUPABASE_ANON_KEY'],
    })
  })

  it('treats placeholder values as not configured', () => {
    expect(
      getSupabaseConfigStatus({
        anonKey: 'your-supabase-anon-key',
        url: 'https://your-project.supabase.co',
      }),
    ).toEqual({
      isConfigured: false,
      missingKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    })
  })

  it('creates a client when configuration is present and trims values', () => {
    const status = getSupabaseConfigStatus({
      anonKey: ' configured-anon-token ',
      url: ' https://example.supabase.co ',
    })
    const client = createSupabaseBrowserClient({
      anonKey: ' configured-anon-token ',
      url: ' https://example.supabase.co ',
    })

    expect(status).toEqual({
      isConfigured: true,
      missingKeys: [],
    })
    expect(client?.auth?.getSession).toEqual(expect.any(Function))
  })
})
