// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './auth/AuthProvider.jsx'
import App from './App.jsx'

describe('App auth fallback', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    })
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('remains usable without login or Supabase configuration', () => {
    const html = renderToStaticMarkup(
      <AuthProvider client={null}>
        <App />
      </AuthProvider>,
    )

    expect(html).toContain('Move at work')
    expect(html).toContain('Bewegungsplan erstellen')
  })

  it('hides the global header on the Today screen after onboarding', () => {
    window.localStorage.setItem(
      'move-at-work-onboarding',
      JSON.stringify(createCompleteAnswers()),
    )
    const html = renderToStaticMarkup(
      <AuthProvider client={null}>
        <App />
      </AuthProvider>,
    )

    expect(html).not.toContain('Move at work</p>')
    expect(html).not.toContain('Bewegungsimpulse für den Arbeitstag')
    expect(html).not.toContain('Dunkel')
    expect(html).not.toContain('Hell')
    expect(html).toContain('Dein individueller Tagesplan')
    expect(html).toContain('Move-at-work-Tag')
  })
})

function createCompleteAnswers() {
  return {
    currentWorkplace: 'office',
    defaultWorkplace: 'office',
    fitnessLevel: 'balanced',
    goal: 'habit',
    situation: 'mixed-day',
    workplaces: ['office'],
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
  }
}
