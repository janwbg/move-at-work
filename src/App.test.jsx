// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './auth/AuthProvider.jsx'
import App from './App.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('App auth fallback', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
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
    expect(html).toContain('Sitzphasen unterbrechen, ohne aus dem Arbeitstag rauszukommen.')
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
    expect(html).toContain('Dein Tagesplan')
    expect(html).toContain('Move at work Tag')
  })

  it('keeps the global header hidden on the Progress screen after onboarding', async () => {
    window.localStorage.setItem(
      'move-at-work-onboarding',
      JSON.stringify(createCompleteAnswers()),
    )

    await act(async () => {
      createRoot(document.body.appendChild(document.createElement('div'))).render(
        <AuthProvider client={null}>
          <App />
        </AuthProvider>,
      )
    })

    await clickButtonContaining('Routine')

    expect(document.body.textContent).toContain('Deine Routine')
    expect(document.body.textContent).not.toContain(
      'Bewegungsimpulse für den Arbeitstag',
    )
    expect(document.body.textContent).not.toContain('Dunkel')
    expect(document.body.textContent).not.toContain('Hell')
  })

  it('hides the global header on Settings and uses the in-settings theme switch', async () => {
    window.localStorage.setItem(
      'move-at-work-onboarding',
      JSON.stringify(createCompleteAnswers()),
    )

    await act(async () => {
      createRoot(document.body.appendChild(document.createElement('div'))).render(
        <AuthProvider client={null}>
          <App />
        </AuthProvider>,
      )
    })

    await clickButtonContaining('Einstellungen')

    expect(document.body.textContent).toContain(
      'Passe Move at work an deinen Alltag an.',
    )
    expect(document.body.textContent).not.toContain('Bewegungsimpulse')
    expect(document.body.textContent).toContain('Darstellung: Hell')
    expect(document.body.textContent).toContain('Zu Dunkel wechseln')

    await clickButtonContaining('Zu Dunkel wechseln')

    expect(document.body.textContent).toContain('Darstellung: Dunkel')
    expect(document.body.textContent).toContain('Zu Hell wechseln')
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

async function clickButtonContaining(text) {
  const button = [...document.querySelectorAll('button')].find((candidate) =>
    candidate.textContent.includes(text),
  )

  expect(button).toBeTruthy()

  await act(async () => {
    button.click()
  })
}
