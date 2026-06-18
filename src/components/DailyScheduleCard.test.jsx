import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DailyScheduleCard from './DailyScheduleCard.jsx'

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

  it('labels mini-resets as a deliberate category', () => {
    const html = renderCard({
      section: {
        ...section,
        duration: '30 Sekunden',
        movementType: 'mini_reset',
        title: '30 Sekunden Schultern kreisen',
      },
    })

    expect(html).toContain('Mini-Reset')
    expect(html).toContain('30 Sekunden')
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

  it('shows a discreet replacement button next to the open action', () => {
    const html = renderCard()

    expect(html).toContain('Übung öffnen')
    expect(html).toContain('aria-label="Andere Empfehlung wählen"')
    expect(html).toContain('↻')
    expect(html.indexOf('Übung öffnen')).toBeLessThan(
      html.indexOf('Andere Empfehlung wählen'),
    )
  })

  it('does not offer replacement for completed recommendations', () => {
    const html = renderCard({ completed: true })

    expect(html).not.toContain('aria-label="Andere Empfehlung wählen"')
    expect(html).not.toContain('↻')
  })

  it('can show grouped replacement reasons on the card', () => {
    const html = renderCard({ initialReplaceDialogOpen: true })

    expect(html).toContain('Warum möchtest du diese Empfehlung wechseln?')
    expect(html).toContain('Arbeitssituation')
    expect(html).toContain('Zeit')
    expect(html).toContain('Umgebung')
    expect(html).toContain('Energie und Körper')
    expect(html).toContain('Bin im Meeting')
    expect(html).toContain('Habe wenig Zeit')
    expect(html).toContain('Lieber gehen')
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
