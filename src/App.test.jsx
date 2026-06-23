import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './auth/AuthProvider.jsx'
import App from './App.jsx'

describe('App auth fallback', () => {
  it('remains usable without login or Supabase configuration', () => {
    const html = renderToStaticMarkup(
      <AuthProvider client={null}>
        <App />
      </AuthProvider>,
    )

    expect(html).toContain('Move at work')
    expect(html).toContain('Bewegungsplan erstellen')
  })
})

