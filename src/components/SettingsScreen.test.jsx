// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SettingsScreen from './SettingsScreen.jsx'
import { confirmRestartOnboarding } from './settingsActions.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const answers = {
  fitnessLevel: 'balanced',
  goal: 'habit',
  situation: 'mixed-day',
  workplaces: ['office'],
  defaultWorkplace: 'office',
  currentWorkplace: 'office',
  workplaceSetups: {
    office: ['no-equipment'],
    homeoffice: ['no-equipment'],
  },
}

const mixedAnswers = {
  ...answers,
  workplaces: ['office', 'homeoffice'],
  workplaceSetups: {
    office: ['no-equipment'],
    homeoffice: ['walking-pad'],
  },
}

afterEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('SettingsScreen', () => {
  it('shows the six compact overview cards with icons', () => {
    const html = renderSettings()

    expect(html).toContain(
      'Passe Profil, Routine, Erinnerungen und Darstellung an deinen Alltag an.',
    )
    expect(html).toContain('Bewegungsprofil')
    expect(html).toContain('Arbeits-/Lernroutine')
    expect(html).toContain('Erinnerungen')
    expect(html).toContain('Konto &amp; Plus')
    expect(html).toContain('Feedback zum Praxistest')
    expect(html).toContain('Darstellung &amp; Einrichtung')
    expect(html).toContain('Weniger sitzen · Büro · Ausgeglichen')
    expect(html).toContain('Standard: Büro')
    expect(html).toContain('data-testid="settings-icon-profile"')
    expect(html).toContain('data-testid="settings-icon-routine"')
    expect(html).toContain('data-testid="settings-icon-reminders"')
    expect(html).toContain('data-testid="settings-icon-account"')
    expect(html).toContain('data-testid="settings-icon-feedback"')
    expect(html).toContain('data-testid="settings-icon-setup"')
  })

  it('renders the settings title without the old duplicate label', () => {
    const html = renderSettings()

    expect(countOccurrences(html, '>Einstellungen<')).toBe(1)
    expect(html).not.toContain('MOVE AT WORK')
    expect(html).not.toContain('Bewegungsimpulse')
  })

  it('keeps edit screens, setup options and auth off the initial overview', () => {
    const html = renderSettings()

    expect(html).not.toContain(
      'Änderungen gelten für zukünftige und offene Empfehlungen.',
    )
    expect(html).not.toContain('Höhenverstellbarer Schreibtisch')
    expect(html).not.toContain('Walking Pad')
    expect(html).not.toContain('Passwort')
    expect(html).not.toContain('Auth ist noch nicht konfiguriert.')
    expect(html).not.toContain('VITE_SUPABASE_URL')
  })

  it('replaces the overview with the profile detail and returns back', async () => {
    await renderInteractiveSettings({ answers: mixedAnswers })

    await clickNthButtonContaining('Bearbeiten', 0)

    expect(document.body.textContent).toContain('Passe Ziel, Arbeitsorte und Setups an.')
    expect(document.body.textContent).toContain(
      'Änderungen gelten für zukünftige und offene Empfehlungen.',
    )
    expect(document.body.textContent).toContain('Ziel')
    expect(document.body.textContent).toContain('Intensität')
    expect(document.body.textContent).toContain('Typischer Arbeitstag')
    expect(document.body.textContent).toContain('Büro')
    expect(document.body.textContent).toContain('Homeoffice')
    expect(document.body.textContent).not.toContain('Feedback zum Praxistest')

    await clickButtonContaining('Zurück')

    expect(document.body.textContent).toContain('Feedback zum Praxistest')
    expect(document.body.textContent).toContain('Darstellung & Einrichtung')
  })

  it('opens office setup as its own screen and returns to profile', async () => {
    await renderInteractiveSettings({ answers: mixedAnswers })

    await clickNthButtonContaining('Bearbeiten', 0)
    await clickNthButtonContaining('Setup bearbeiten', 0)

    expect(document.body.textContent).toContain('Setup im Büro')
    expect(document.body.textContent).toContain('Büro · Kein besonderes Equipment')
    expect(document.body.textContent).toContain('Höhenverstellbarer Schreibtisch')
    expect(document.body.textContent).toContain('Widerstandsband')
    expect(document.body.textContent).not.toContain('Setup im Homeoffice')

    await clickButtonContaining('Zurück')

    expect(document.body.textContent).toContain('Bewegungsprofil')
    expect(document.body.textContent).toContain('Arbeitsorte')
    expect(document.body.textContent).not.toContain('Feedback zum Praxistest')
  })

  it('opens homeoffice setup when homeoffice is active', async () => {
    await renderInteractiveSettings({ answers: mixedAnswers })

    await clickNthButtonContaining('Bearbeiten', 0)
    await clickNthButtonContaining('Setup bearbeiten', 1)

    expect(document.body.textContent).toContain('Setup im Homeoffice')
    expect(document.body.textContent).toContain('Homeoffice · 1 Optionen aktiv')
    expect(document.body.textContent).toContain('Walking Pad')
    expect(document.body.textContent).not.toContain('Setup im Büro')
  })

  it('does not show setup chips or setup edit action for inactive workplaces', async () => {
    await renderInteractiveSettings()

    await clickNthButtonContaining('Bearbeiten', 0)

    expect(document.body.textContent).toContain('Aktuell nicht aktiv')
    expect(countButtonsContaining('Setup bearbeiten')).toBe(1)
    expect(document.body.textContent).not.toContain('Walking Pad')
  })

  it('opens the routine detail and emits changed weekdays', async () => {
    const changeRoutine = vi.fn()
    await renderInteractiveSettings({
      onRoutineSettingsChange: changeRoutine,
      routineSettings: { activeWeekdays: [1, 2, 3, 4, 5] },
    })

    await clickNthButtonContaining('Bearbeiten', 1)
    await clickButtonContaining('Sa')

    expect(document.body.textContent).not.toContain('Bewegungsprofil')
    expect(changeRoutine).toHaveBeenCalledWith({
      activeWeekdays: [1, 2, 3, 4, 5, 6],
    })
  })

  it('shows the theme switch inside Darstellung & Einrichtung', async () => {
    const toggleTheme = vi.fn()
    await renderInteractiveSettings({
      isDark: false,
      onToggleTheme: toggleTheme,
    })

    expect(document.body.textContent).toContain('Darstellung: Hell')
    expect(document.body.textContent).toContain('Zu Dunkel wechseln')

    await clickButtonContaining('Zu Dunkel wechseln')

    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })

  it('uses the light-mode target label when dark mode is active', () => {
    const html = renderSettings({ isDark: true })

    expect(html).toContain('Darstellung: Dunkel')
    expect(html).toContain('Zu Hell wechseln')
  })

  it('keeps at least one active routine day selected', async () => {
    const changeRoutine = vi.fn()
    await renderInteractiveSettings({
      onRoutineSettingsChange: changeRoutine,
      routineSettings: { activeWeekdays: [1] },
    })

    await clickNthButtonContaining('Bearbeiten', 1)
    await clickButtonContaining('Mo')

    expect(changeRoutine).not.toHaveBeenCalled()
  })

  it('opens reminder details with mode and do-not-disturb controls', async () => {
    await renderInteractiveSettings()

    await clickButtonContaining('Anpassen')

    expect(document.body.textContent).toContain('Steuere, wann und wie dich Move at work erinnert.')
    expect(document.body.textContent).toContain('Erinnerungen aktivieren')
    expect(document.body.textContent).toContain('Sanft')
    expect(document.body.textContent).toContain('Normal')
    expect(document.body.textContent).toContain('Aktiv')
    expect(document.body.textContent).toContain('Für 1 Stunde pausieren')
    expect(document.body.textContent).toContain('Für heute pausieren')
    expect(document.body.textContent).not.toContain('Konto & Plus')
  })

  it('opens account detail with AuthPanel and returns to overview', async () => {
    await renderInteractiveSettings()

    expect(document.body.textContent).not.toContain('Auth ist noch nicht konfiguriert.')

    await clickButtonContaining('Anmelden oder Konto erstellen')

    expect(document.body.textContent).toContain('Konto & Plus')
    expect(document.body.textContent).toContain('Auth ist noch nicht konfiguriert.')
    expect(document.body.textContent).toContain('VITE_SUPABASE_URL')
    expect(document.body.textContent).toContain('Plus ansehen')
    expect(document.body.textContent).not.toContain('Feedback zum Praxistest')

    await clickButtonContaining('Zurück')

    expect(document.body.textContent).toContain('Feedback zum Praxistest')
    expect(document.body.textContent).not.toContain('Auth ist noch nicht konfiguriert.')
  })

  it('opens the upgrade view from the Plus button', async () => {
    const openUpgrade = vi.fn()
    await renderInteractiveSettings({ onOpenUpgrade: openUpgrade })

    await clickButtonContaining('Plus ansehen')

    expect(openUpgrade).toHaveBeenCalledTimes(1)
  })

  it('reopens onboarding only after confirmation', () => {
    const restart = vi.fn()

    expect(confirmRestartOnboarding(restart, () => false)).toBe(false)
    expect(restart).not.toHaveBeenCalled()

    expect(confirmRestartOnboarding(restart, () => true)).toBe(true)
    expect(restart).toHaveBeenCalledTimes(1)
  })
})

function renderSettings(props = {}) {
  return renderToStaticMarkup(
    <SettingsScreen
      answers={answers}
      onChangeAnswers={() => {}}
      onRestartOnboarding={() => {}}
      {...props}
    />,
  )
}

async function renderInteractiveSettings(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <SettingsScreen
        answers={answers}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
        {...props}
      />,
    )
  })

  return { container, root }
}

async function clickButtonContaining(label) {
  const button = [...document.querySelectorAll('button')].find((element) =>
    element.textContent.includes(label),
  )

  await clickElement(button)
}

async function clickNthButtonContaining(label, index) {
  const button = [...document.querySelectorAll('button')].filter((element) =>
    element.textContent.includes(label),
  )[index]

  await clickElement(button)
}

async function clickElement(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function countButtonsContaining(label) {
  return [...document.querySelectorAll('button')].filter((element) =>
    element.textContent.includes(label),
  ).length
}

function countOccurrences(value, search) {
  return value.split(search).length - 1
}
