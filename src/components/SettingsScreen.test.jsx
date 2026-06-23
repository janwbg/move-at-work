import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import SettingsScreen from './SettingsScreen.jsx'
import { confirmRestartOnboarding } from './settingsActions.js'

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

describe('SettingsScreen', () => {
  it('shows the temporary onboarding restart action', () => {
    const html = renderToStaticMarkup(
      <SettingsScreen
        answers={answers}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Onboarding neu starten')
    expect(html).toContain('Dein Fortschritt bleibt erhalten.')
  })

  it('shows the practice test feedback area', () => {
    const html = renderToStaticMarkup(
      <SettingsScreen
        answers={answers}
        feedbackUrl="https://example.com/feedback"
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Feedback zum Praxistest')
    expect(html).toContain(
      'Du testest gerade eine frühe Version von Move at work. Dein Feedback hilft dabei, die Empfehlungen verständlicher, passender und alltagstauglicher zu machen.',
    )
    expect(html).toContain('Feedback geben')
    expect(html).toContain('href="https://example.com/feedback"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })

  it('shows the Move at work Plus area', () => {
    const html = renderToStaticMarkup(
      <SettingsScreen
        answers={answers}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Move at work Plus')
    expect(html).toContain('Mehr Freiheit für deinen Tagesplan')
    expect(html).toContain('Plus ansehen')
  })

  it('shows the account area without requiring login', () => {
    const html = renderToStaticMarkup(
      <SettingsScreen
        answers={answers}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Konto')
    expect(html).toContain(
      'Melde dich an, damit Plus später deinem Konto zugeordnet werden kann.',
    )
    expect(html).toContain('Konto-Funktionen sind aktuell nicht konfiguriert.')
  })

  it('opens the upgrade view from the Plus button', () => {
    const openUpgrade = vi.fn()
    const tree = SettingsScreen({
      answers,
      onChangeAnswers: () => {},
      onOpenUpgrade: openUpgrade,
      onRestartOnboarding: () => {},
    })
    const button = findElementByText(tree, 'Plus ansehen')

    button.props.onClick()

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

function findElementByText(element, text) {
  if (!element || typeof element !== 'object') {
    return null
  }

  if (element.props?.children === text) {
    return element
  }

  const children = Array.isArray(element.props?.children)
    ? element.props.children
    : [element.props?.children]

  for (const child of children) {
    const result = findElementByText(child, text)

    if (result) {
      return result
    }
  }

  return null
}
