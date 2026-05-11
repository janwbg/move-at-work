import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProgressScreen from './ProgressScreen.jsx'

describe('ProgressScreen', () => {
  it('shows progress values from the provided summary', () => {
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
    expect(html).toContain('12')
    expect(html).toContain('4 Tage')
    expect(countOccurrences(html, 'Heute erledigt')).toBe(1)
    expect(countOccurrences(html, 'Diese Woche')).toBe(1)
    expect(countOccurrences(html, 'Tagesstreak')).toBe(1)
  })
})

function countOccurrences(value, search) {
  return value.split(search).length - 1
}
