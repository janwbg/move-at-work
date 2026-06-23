import { describe, expect, it } from 'vitest'
import { createSupabaseBrowserClient } from './supabaseClient.js'

describe('supabaseClient', () => {
  it('does not crash when env variables are missing', () => {
    expect(
      createSupabaseBrowserClient({
        anonKey: '',
        url: '',
      }),
    ).toBeNull()
  })

  it('creates a client when configuration is present', () => {
    const client = createSupabaseBrowserClient({
      anonKey: 'anon-key',
      url: 'https://example.supabase.co',
    })

    expect(client?.auth?.getSession).toEqual(expect.any(Function))
  })
})

