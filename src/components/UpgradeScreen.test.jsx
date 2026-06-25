import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import UpgradeScreen from './UpgradeScreen.jsx'

describe('UpgradeScreen', () => {
  it('renders the title, positioning and availability note', () => {
    const html = renderUpgradeScreen()

    expect(html).toContain('Move at work Plus')
    expect(html).toContain('Mehr Anpassung')
    expect(html).toContain('Geplant')
    expect(html).toContain('Plus ist aktuell vorbereitet, aber noch nicht kaufbar.')
  })

  it('shows Free vs. planned Plus positioning', () => {
    const html = renderUpgradeScreen()

    expect(html).toContain('Free vs. Plus')
    expect(html).toContain('Mehr Wechselmöglichkeiten')
    expect(html).toContain('1x/Tag')
    expect(html).toContain('geplant')
  })

  it('marks planned features as planned instead of available today', () => {
    const html = renderUpgradeScreen()

    expect(html).toContain('Geplant')
    expect(html).toContain(
      'Diese Funktionen sind geplant und noch nicht Teil des aktuellen Plus-Umfangs.',
    )
    expect(html).toContain('Erweiterte Routinen')
    expect(html).toContain('Bessere Anpassung an deinen Tageskontext')
  })

  it('shows active status for Plus users', () => {
    const html = renderUpgradeScreen({ premiumStatus: 'plus' })

    expect(html).toContain('Plus ist aktiv')
    expect(html).not.toContain('Checkout folgt im nächsten Schritt')
  })

  it('shows an account hint for logged-out users', () => {
    const html = renderUpgradeScreen()

    expect(html).toContain('Für ein späteres Plus-Abo brauchst du ein Konto.')
  })

  it('shows an account hint for authenticated users', () => {
    const html = renderUpgradeScreen({
      auth: {
        isAuthenticated: true,
      },
    })

    expect(html).toContain(
      'Du bist angemeldet. Plus kann später diesem Konto zugeordnet werden.',
    )
  })

  it('does not trigger a real checkout for Free users', () => {
    const html = renderUpgradeScreen()

    expect(html).toContain('Plus wird vorbereitet')
    expect(html).toContain('Plus ist aktuell vorbereitet, aber noch nicht kaufbar.')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('stripe')
    expect(html).not.toContain('checkout.stripe')
  })
})

function renderUpgradeScreen(props = {}) {
  return renderToStaticMarkup(
    <UpgradeScreen
      auth={{ isAuthenticated: false }}
      onBack={() => {}}
      premiumStatus="free"
      {...props}
    />,
  )
}
