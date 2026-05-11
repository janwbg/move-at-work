import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProfileSettings from './ProfileSettings.jsx'

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

describe('ProfileSettings', () => {
  it('renders the workplace profile setting', () => {
    const html = renderToStaticMarkup(
      <ProfileSettings answers={answers} onChange={() => {}} />,
    )

    expect(html).toContain('Arbeitsorte und Setup')
    expect(html).toContain('Buero')
    expect(html).toContain('Homeoffice')
    expect(html).toContain('Standard-Arbeitsort')
    expect(html).toContain('Setup im Buero')
    expect(html).toContain('Setup im Homeoffice')
    expect(html).toContain('jederzeit anpassen')
  })
})
