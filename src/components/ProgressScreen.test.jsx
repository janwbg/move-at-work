import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProgressScreen from './ProgressScreen.jsx'

describe('ProgressScreen', () => {
  it('shows the workday progress values from the provided summary without duplicates', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday: 3,
          completedThisWeek: 12,
          streak: 4,
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain('Fortschritt')
    expect(html).toContain('3/5')
    expect(html).toContain('3 von 5 Microbreaks erledigt')
    expect(html).toContain('12')
    expect(html).toContain('4 Arbeitstage in Folge')
    expect(html).toContain('<svg')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('Diese Arbeitswoche')
    expect(html).toContain('Wochenenden unterbrechen deine Streak nicht.')
    expect(html).not.toContain('Tagesstreak')
    expect(countOccurrences(html, 'Heute erledigt')).toBe(1)
    expect(countOccurrences(html, 'Diese Arbeitswoche')).toBe(1)
    expect(countOccurrences(html, 'Arbeitsstreak')).toBe(1)
  })

  it.each([
    [0, 5, '0/5'],
    [1, 5, '1/5'],
    [5, 5, '5/5'],
    [0, 0, 'Noch kein Tagesplan verfügbar'],
  ])('renders the progress ring safely for %i of %i', (completedToday, totalToday, expectedText) => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday,
          completedThisWeek: completedToday,
          streak: completedToday > 0 ? 1 : 0,
        }}
        totalToday={totalToday}
      />,
    )

    expect(html).toContain('<svg')
    expect(html).toContain(expectedText)
  })

  it('does not show the recommendation feedback summary', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        feedbackSummary={{
          total: 4,
          fit: 3,
          notFit: 1,
          mostCommonReason: 'Keine Zeit',
        }}
        summary={{
          completedToday: 2,
          completedThisWeek: 5,
          streak: 2,
        }}
        totalToday={5}
      />,
    )

    expect(html).not.toContain('Empfehlungsfeedback')
    expect(html).not.toContain('Gespeichert')
    expect(html).not.toContain('Hat gepasst')
    expect(html).not.toContain('Eher nicht')
    expect(html).not.toContain('Häufigster Grund')
    expect(html).toContain('Heute erledigt')
    expect(html).toContain('Diese Arbeitswoche')
    expect(html).toContain('Arbeitsstreak')
  })
})

function countOccurrences(value, search) {
  return value.split(search).length - 1
}
