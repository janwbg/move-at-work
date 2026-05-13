import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import { replacementReasonOptions } from './replacementReasons.js'

const section = {
  description: 'Kurz bewegen und Schultern lockern.',
  duration: '2 Minuten',
  id: 'morning-mobility',
  instructionSteps: [
    'Setze dich aufrecht hin.',
    'Kreise die Schultern langsam nach hinten.',
    'Atme ruhig weiter und löse die Schultern.',
  ],
  movementType: 'mobilize',
  reason: 'Hilft beim Start in den Arbeitstag.',
  setup: 'Kein spezielles Equipment',
  timeLabel: 'Morgens',
  title: 'Schulterkreisen',
}

describe('DailyScheduleCard', () => {
  it('renders completed exercises with a clear completed state', () => {
    const html = renderCard({ completed: true })

    expect(html).toContain('Erledigt')
    expect(html).toContain('bg-emerald')
    expect(html).not.toContain('Offen')
  })

  it('shows the compact card information without why boxes', () => {
    const html = renderCard()

    expect(html).toContain('Schulterkreisen')
    expect(html).toContain('2 Minuten')
    expect(html).toContain('Hilft beim Start in den Arbeitstag.')
    expect(html).toContain('Mobilisieren')
    expect(html).not.toContain('Warum:')
    expect(html).not.toContain('Setup:')
  })

  it('does not render inline exercise details anymore', () => {
    const html = renderCard()

    expect(html).not.toContain('So geht')
    expect(html).not.toContain('Kreise die Schultern langsam nach hinten.')
    expect(html).not.toContain('aria-expanded')
    expect(html).toContain('Übung öffnen')
  })

  it('does not show an open badge', () => {
    const html = renderCard()

    expect(html).not.toContain('Offen')
  })

  it('keeps the replacement button', () => {
    const html = renderCard()

    expect(html).toContain('aria-label="Empfehlung wechseln"')
    expect(html).toContain('↻')
  })

  it('can render the replacement reason dialog with all reasons', () => {
    const html = renderCard({ initialReplaceDialogOpen: true })

    expect(html).toContain('Warum möchtest du diese Empfehlung wechseln?')
    for (const reason of replacementReasonOptions) {
      expect(html).toContain(reason.label)
    }
  })

  it('shows a cancel action in the replacement dialog', () => {
    const html = renderCard({ initialReplaceDialogOpen: true })

    expect(html).toContain('Abbrechen')
  })
})

function renderCard(props = {}) {
  return renderToStaticMarkup(
    <DailyScheduleCard
      completed={false}
      onComplete={() => {}}
      onOpenDetails={() => {}}
      section={section}
      stepNumber={1}
      {...props}
    />,
  )
}
