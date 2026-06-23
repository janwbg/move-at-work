// @vitest-environment happy-dom

import { act, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthProvider.jsx'
import { useAuth } from './useAuth.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('AuthProvider', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    window.localStorage.clear()
  })

  it('keeps auth unavailable without a Supabase client', async () => {
    await renderAuthProbe({ client: null })

    expect(document.body.textContent).toContain('available:false')
    expect(document.body.textContent).toContain('authenticated:false')
  })

  it('loads the current Supabase session', async () => {
    await renderAuthProbe({
      client: createClient({
        session: { user: { email: 'session@example.com' } },
      }),
    })

    expect(document.body.textContent).toContain('session@example.com')
    expect(document.body.textContent).toContain('authenticated:true')
  })

  it('signOut does not clear existing Move at work localStorage data', async () => {
    window.localStorage.setItem('move-at-work-onboarding', '{"goal":"habit"}')
    window.localStorage.setItem('move-at-work-premium-status', 'plus')
    const signOut = vi.fn().mockResolvedValue({ error: null })

    await renderAuthProbe({
      client: createClient({
        session: { user: { email: 'session@example.com' } },
        signOut,
      }),
      signOutOnReady: true,
    })

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem('move-at-work-onboarding')).toBe(
      '{"goal":"habit"}',
    )
    expect(window.localStorage.getItem('move-at-work-premium-status')).toBe('plus')
  })
})

async function renderAuthProbe({ client, signOutOnReady = false }) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <AuthProvider client={client}>
        <AuthProbe signOutOnReady={signOutOnReady} />
      </AuthProvider>,
    )
  })
}

function AuthProbe({ signOutOnReady }) {
  const auth = useAuth()
  const signedOutRef = useRef(false)

  useEffect(() => {
    if (signOutOnReady && auth.isAuthenticated && !signedOutRef.current) {
      signedOutRef.current = true
      auth.signOut()
    }
  }, [auth, signOutOnReady])

  return (
    <div>
      available:{String(auth.isAuthAvailable)} authenticated:
      {String(auth.isAuthenticated)} email:{auth.user?.email ?? ''}
    </div>
  )
}

function createClient({ session = null, signOut = vi.fn().mockResolvedValue({ error: null }) } = {}) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut,
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  }
}
