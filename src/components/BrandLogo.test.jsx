import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BrandLogo from './BrandLogo.jsx'

describe('BrandLogo', () => {
  it('renders the updated local mark without text in mark mode', () => {
    const html = renderToStaticMarkup(<BrandLogo variant="mark" />)

    expect(html).toContain('aria-label="Move at work Logo"')
    expect(html).toContain('rx="20"')
    expect(html).toContain('stroke-width="5.5"')
    expect(html).toContain('stroke-width="4.8"')
    expect(html).not.toContain('>Move at work</span>')
  })
})
