import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ExerciseDetailView from './ExerciseDetailView.jsx'
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

describe('ExerciseDetailView', () => {
  it('shows title, duration and numbered instruction steps', () => {
    const html = renderDetail()

    expect(html).toContain('Schulterkreisen')
    expect(html).toContain('2 Minuten')
    expect(html).toContain('So geht')
    expect(html).toContain('Kreise die Schultern langsam nach hinten.')
    expect(html).toContain('<ol')
  })

  it('shows a back action and the main exercise actions', () => {
    const html = renderDetail()

    expect(html).toContain('Zurück')
    expect(html).toContain('Timer starten')
    expect(html).toContain('Als erledigt markieren')
    expect(html).toContain('Andere Empfehlung')
  })

  it('shows reset only once the timer has run', () => {
    const idleHtml = renderDetail()
    const runningHtml = renderDetail({ initialTimerState: 'running' })

    expect(idleHtml).not.toContain('Zurücksetzen')
    expect(runningHtml).toContain('Zurücksetzen')
  })

  it('can render the same replacement reasons as the schedule card', () => {
    const html = renderDetail({ initialReplaceDialogOpen: true })

    expect(html).toContain('Warum möchtest du diese Empfehlung wechseln?')
    for (const reason of replacementReasonOptions) {
      expect(html).toContain(reason.label)
    }
  })

  it('shows completed state without removing the detail content', () => {
    const html = renderDetail({ completed: true })

    expect(html).toContain('Erledigt')
    expect(html).toContain('Schulterkreisen')
    expect(html).toContain('So geht')
  })
})

function renderDetail(props = {}) {
  return renderToStaticMarkup(
    <ExerciseDetailView
      completed={false}
      onBack={() => {}}
      onComplete={() => {}}
      onReplace={() => {}}
      section={section}
      {...props}
    />,
  )
}
