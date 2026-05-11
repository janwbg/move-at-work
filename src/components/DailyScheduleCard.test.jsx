import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DailyScheduleCard from './DailyScheduleCard.jsx'

const section = {
  description: 'Kurz bewegen und Schultern lockern.',
  duration: '2 Minuten',
  id: 'morning-mobility',
  movementType: 'mobility',
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
})
