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

  it('reopens onboarding only after confirmation', () => {
    const restart = vi.fn()

    expect(confirmRestartOnboarding(restart, () => false)).toBe(false)
    expect(restart).not.toHaveBeenCalled()

    expect(confirmRestartOnboarding(restart, () => true)).toBe(true)
    expect(restart).toHaveBeenCalledTimes(1)
  })
})
