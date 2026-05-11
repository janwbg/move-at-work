import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BottomNavigation from './BottomNavigation.jsx'

describe('BottomNavigation', () => {
  it('renders the three main tabs and marks the active tab', () => {
    const html = renderToStaticMarkup(
      <BottomNavigation activeTab="progress" onChange={() => {}} />,
    )

    expect(html).toContain('Heute')
    expect(html).toContain('Fortschritt')
    expect(html).toContain('Einstellungen')
    expect(html).toContain('aria-current="page"')
  })
})
