import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ExerciseDetailView from './ExerciseDetailView.jsx'
import { getTimerActionLabel, shouldAdvanceTimer } from './exerciseTimer.js'
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

  it('shows a back action and the main exercise actions for open exercises', () => {
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

  it('shows the start action before the timer has started', () => {
    const html = renderDetail()

    expect(html).toContain('Timer starten')
    expect(html).not.toContain('Pause')
    expect(html).not.toContain('Fortsetzen')
  })

  it('shows a pause action while the timer is running', () => {
    const html = renderDetail({
      initialRemainingSeconds: 90,
      initialTimerState: 'running',
    })

    expect(html).toContain('1:30')
    expect(html).toContain('Pause')
    expect(html).not.toContain('Timer starten')
    expect(html).not.toContain('Fortsetzen')
  })

  it('uses seconds durations for mini-resets without converting them to minutes', () => {
    const html = renderDetail({
      initialTimerState: 'running',
      section: {
        ...section,
        duration: '30 Sekunden',
        durationMinutes: 0.5,
        movementType: 'mini_reset',
      },
    })

    expect(html).toContain('0:30')
    expect(html).not.toContain('30:00')
  })

  it('keeps the remaining time visible while the timer is paused', () => {
    const html = renderDetail({
      initialRemainingSeconds: 90,
      initialTimerState: 'paused',
    })

    expect(html).toContain('1:30')
    expect(html).toContain('Fortsetzen')
    expect(html).not.toContain('Pause')
    expect(html).not.toContain('Beendet')
  })

  it('maps timer states to the correct primary action labels', () => {
    expect(getTimerActionLabel('idle')).toBe('Timer starten')
    expect(getTimerActionLabel('running')).toBe('Pause')
    expect(getTimerActionLabel('paused')).toBe('Fortsetzen')
    expect(getTimerActionLabel('finished')).toBeNull()
  })

  it('advances the countdown only while the timer is running', () => {
    expect(shouldAdvanceTimer({ completed: false, timerState: 'running' })).toBe(
      true,
    )
    expect(shouldAdvanceTimer({ completed: false, timerState: 'paused' })).toBe(
      false,
    )
    expect(shouldAdvanceTimer({ completed: false, timerState: 'idle' })).toBe(
      false,
    )
    expect(shouldAdvanceTimer({ completed: true, timerState: 'running' })).toBe(
      false,
    )
  })

  it('can render the same replacement reasons from the detail view', () => {
    const html = renderDetail({ initialReplaceDialogOpen: true })

    expect(html).toContain('Warum möchtest du diese Empfehlung wechseln?')
    expect(html).toContain('Arbeitssituation')
    expect(html).toContain('Zeit')
    expect(html).toContain('Umgebung')
    expect(html).toContain('Energie und Körper')
    for (const reason of replacementReasonOptions) {
      expect(html).toContain(reason.label)
    }
  })

  it('shows completed state without removing the detail content', () => {
    const html = renderDetail({ completed: true })

    expect(html).toContain('Erledigt')
    expect(html).toContain('Diese Übung ist erledigt.')
    expect(html).toContain('Schulterkreisen')
    expect(html).toContain('So geht')
  })

  it('does not offer timer, completion or replacement actions for completed exercises', () => {
    const html = renderDetail({
      completed: true,
      initialReplaceDialogOpen: true,
      initialTimerState: 'running',
    })

    expect(html).not.toContain('Timer starten')
    expect(html).not.toContain('Pause')
    expect(html).not.toContain('Fortsetzen')
    expect(html).not.toContain('Als erledigt markieren')
    expect(html).not.toContain('Andere Empfehlung')
    expect(html).not.toContain('Warum möchtest du diese Empfehlung wechseln?')
    expect(html).not.toContain('Zurücksetzen')
    expect(html).toContain('Zurück')
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
