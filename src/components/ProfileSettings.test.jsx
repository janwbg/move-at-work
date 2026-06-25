// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProfileSettings, {
  SetupSettingsScreen,
} from './ProfileSettings.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const answers = {
  fitnessLevel: 'balanced',
  goal: 'habit',
  situation: 'mixed-day',
  workplaces: ['office', 'homeoffice'],
  defaultWorkplace: 'office',
  currentWorkplace: 'office',
  workplaceSetups: {
    office: ['no-equipment'],
    homeoffice: ['walking-pad'],
  },
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ProfileSettings', () => {
  it('renders the compact profile detail editor', () => {
    const html = renderToStaticMarkup(
      <ProfileSettings answers={answers} onChange={() => {}} />,
    )

    expect(html).toContain('Bewegungsprofil')
    expect(html).toContain('Passe Ziel, Arbeitsorte und Setups an.')
    expect(html).toContain(
      'Änderungen gelten für zukünftige und offene Empfehlungen. Bereits erledigte Übungen bleiben erhalten.',
    )
    expect(html).toContain('Ziel &amp; Tageslogik')
    expect(html).toContain('Ziel')
    expect(html).toContain('Intensität')
    expect(html).toContain('Typischer Tag')
    expect(html).toContain('Büro')
    expect(html).toContain('Homeoffice')
    expect(html).toContain('Standard-Arbeitsort')
    expect(html).toContain('Setup bearbeiten')
    expect(html).toContain('data-testid="workplace-icon-office"')
    expect(html).toContain('data-testid="workplace-icon-homeoffice"')
  })

  it('does not show setup options inside the profile editor', () => {
    const html = renderToStaticMarkup(
      <ProfileSettings answers={answers} onChange={() => {}} />,
    )

    expect(html).not.toContain('Höhenverstellbarer Schreibtisch')
    expect(html).not.toContain('Widerstandsband')
  })

  it('hides setup summary and setup action for inactive workplaces', () => {
    const html = renderToStaticMarkup(
      <ProfileSettings
        answers={{
          ...answers,
          workplaces: ['office'],
        }}
        onChange={() => {}}
      />,
    )

    expect(html).toContain('Aktuell nicht aktiv')
    expect(html).toContain('Kein besonderes Equipment')
    expect(html).not.toContain('Walking Pad')
    expect(countOccurrences(html, 'Setup bearbeiten')).toBe(1)
  })

  it('emits profile changes through the existing profile helpers', async () => {
    const onChange = vi.fn()
    await renderInteractiveProfileSettings({ onChange })
    const [goalSelect, intensitySelect, workdaySelect] =
      document.querySelectorAll('select')

    await changeSelect(goalSelect, 'focus')
    await changeSelect(intensitySelect, 'active')
    await changeSelect(workdaySelect, 'study-day')

    expect(onChange).toHaveBeenCalledTimes(3)
    expect(typeof onChange.mock.calls[0][0]).toBe('function')
  })

  it('opens setup editing through the provided callback', async () => {
    const onEditSetup = vi.fn()
    await renderInteractiveProfileSettings({ onEditSetup })

    await clickNthButtonContaining('Setup bearbeiten', 1)

    expect(onEditSetup).toHaveBeenCalledWith('homeoffice')
  })

  it('renders a single-workplace setup screen', () => {
    const html = renderToStaticMarkup(
      <SetupSettingsScreen
        onBack={() => {}}
        onToggle={() => {}}
        setup={answers.workplaceSetups.office}
        workplace="office"
      />,
    )

    expect(html).toContain('Setup im Büro')
    expect(html).toContain('Büro · Kein besonderes Equipment')
    expect(html).toContain('Höhenverstellbarer Schreibtisch')
    expect(html).toContain('Walking Pad')
    expect(html).toContain('Widerstandsband')
    expect(html).not.toContain('Setup im Homeoffice')
  })
})

async function renderInteractiveProfileSettings(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <ProfileSettings
        answers={answers}
        onChange={() => {}}
        {...props}
      />,
    )
  })

  return { container, root }
}

async function clickNthButtonContaining(label, index) {
  const button = [...document.querySelectorAll('button')].filter((element) =>
    element.textContent.includes(label),
  )[index]

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

async function changeSelect(select, value) {
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function countOccurrences(value, search) {
  return value.split(search).length - 1
}
