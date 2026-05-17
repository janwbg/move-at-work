import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SuccessDialog } from './ResultScreen.jsx'

const summary = {
  completedToday: 1,
  completedThisWeek: 1,
  streak: 1,
}

describe('SuccessDialog', () => {
  it('shows the recommendation feedback question', () => {
    const html = renderToStaticMarkup(
      <SuccessDialog
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )

    expect(html).toContain('Hat diese Empfehlung gerade gepasst?')
    expect(html).toContain('Ja, hat gepasst')
    expect(html).toContain('Eher nicht')
  })

  it('shows a secondary practice test feedback link', () => {
    const html = renderToStaticMarkup(
      <SuccessDialog
        feedbackUrl="https://example.com/feedback"
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )

    expect(html).toContain('War die Empfehlung hilfreich?')
    expect(html).toContain(
      'Dein Feedback hilft dabei, die Empfehlungen verständlicher, passender und alltagstauglicher zu machen.',
    )
    expect(html).toContain('Feedback geben')
    expect(html).toContain('href="https://example.com/feedback"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html.indexOf('Feedback geben')).toBeLessThan(
      html.lastIndexOf('type="button"'),
    )
  })

  it('shows optional reasons only after not-fit feedback is selected', () => {
    const neutralHtml = renderToStaticMarkup(
      <SuccessDialog
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )
    const notFitHtml = renderToStaticMarkup(
      <SuccessDialog
        initialFeedback="not-fit"
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )

    expect(neutralHtml).not.toContain('Zu auffällig')
    expect(notFitHtml).toContain('Zu auffällig')
    expect(notFitHtml).toContain('Keine Zeit')
    expect(notFitHtml).toContain('Setup hat nicht gepasst')
  })
})
