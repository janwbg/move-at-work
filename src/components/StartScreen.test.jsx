import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import StartScreen from './StartScreen.jsx'

describe('StartScreen', () => {
  it('shows the three German benefit cards with quiet pictograms', () => {
    const html = renderToStaticMarkup(<StartScreen onStart={() => {}} />)

    expect(html).toContain('Passt in deinen Tagesablauf')
    expect(html).toContain('Keine Planung nötig')
    expect(html).toContain('Besser fühlen, besser arbeiten')
    expect(html).toContain('data-icon-name="benefit-calendar"')
    expect(html).toContain('data-icon-name="benefit-check"')
    expect(html).toContain('data-icon-name="benefit-heart"')
    expect(html).not.toContain('Ohne Workout.')
    expect(html).not.toContain('Ohne Umziehen.')
    expect(html).not.toContain('Ohne Extra-Termin.')
  })
})
