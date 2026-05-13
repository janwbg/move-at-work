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
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('Erledigt')
    expect(html).toContain('bg-emerald')
    expect(html).not.toContain('Offen')
  })

  it('shows the recommendation reason in the compact card', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('Hilft beim Start in den Arbeitstag.')
    expect(html).toContain('Mobilisieren')
  })

  it('shows instruction steps in the expanded detail area', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        initialExpanded
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('So geht')
    expect(html).toContain('Kreise die Schultern langsam nach hinten.')
    expect(html).toContain('<ol')
  })

  it('does not render an instruction section when steps are missing', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        initialExpanded
        onComplete={() => {}}
        section={{ ...section, instructionSteps: undefined }}
        stepNumber={1}
      />,
    )

    expect(html).toContain('Kurz bewegen und Schultern lockern.')
    expect(html).not.toContain('So geht')
  })

  it('shows a discreet replacement button', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('aria-label="Empfehlung wechseln"')
    expect(html).toContain('↻')
  })

  it('can render the replacement reason dialog with all reasons', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        initialReplaceDialogOpen
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('Warum möchtest du diese Empfehlung wechseln?')
    for (const reason of replacementReasonOptions) {
      expect(html).toContain(reason.label)
    }
  })

  it('shows a cancel action in the replacement dialog', () => {
    const html = renderToStaticMarkup(
      <DailyScheduleCard
        completed={false}
        initialReplaceDialogOpen
        onComplete={() => {}}
        section={section}
        stepNumber={1}
      />,
    )

    expect(html).toContain('Abbrechen')
  })
})
