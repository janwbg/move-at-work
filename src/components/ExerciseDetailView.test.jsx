// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ExerciseDetailView from './ExerciseDetailView.jsx'
import { getTimerActionLabel, shouldAdvanceTimer } from './exerciseTimer.js'
import { replacementReasonOptions } from './replacementReasons.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows title, slot label and numbered instruction steps', () => {
    const html = renderDetail()

    expect(html).toContain('Schulterkreisen')
    expect(html).toContain('Morgens')
    expect(html).toContain('Ohne Equipment')
    expect(html).not.toContain('2 Minuten')
    expect(html).toContain('2:00')
    expect(html).toContain('So geht')
    expect(html).toContain('Kreise die Schultern langsam nach hinten.')
    expect(html).toContain('<ol')
    expect(html.indexOf('>1</span>')).toBeLessThan(
      html.indexOf('Setze dich aufrecht hin.'),
    )
  })

  it('shows a quieter back action and the main exercise actions for open exercises', () => {
    const html = renderDetail()

    expect(html).toContain('← Zurück')
    expect(html).toContain('Timer starten')
    expect(html).toContain('Als erledigt markieren')
    expect(html).toContain('Passt gerade nicht? Andere Empfehlung wählen')
  })

  it('separates a final practice hint from the numbered steps', () => {
    const html = renderDetail({
      section: {
        ...section,
        instructionSteps: [
          'Stelle dich stabil an den höhenverstellbaren Schreibtisch.',
          'Verteile dein Gewicht gleichmäßig auf beide Füße.',
          'Wechsle ruhig auf den linken Fuß.',
          'Arbeite danach nur weiter im Stand, wenn die Haltung angenehm bleibt.',
        ],
        setup: 'Höhenverstellbarer Schreibtisch',
        timeLabel: 'Mittagswechsel',
      },
    })

    expect(html).toContain('Mittagswechsel')
    expect(html).toContain('Am Stehtisch')
    expect(html).toContain('Hinweis')
    expect(html).toContain(
      'Arbeite danach nur weiter im Stand, wenn die Haltung angenehm bleibt.',
    )
    expect(html).not.toContain('>4</span>')
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

    expect(html).toContain('Was passt gerade nicht?')
    expect(html).not.toContain('Arbeitssituation')
    expect(html).not.toContain('Umgebung')
    expect(html).not.toContain('Energie und Körper')
    for (const reason of replacementReasonOptions) {
      expect(html).toContain(reason.label)
    }
    expect(html).toContain('Ich habe wenig Zeit')
    expect(html).not.toContain('Keine Zeit')
    expect(html).not.toContain('Lieber kürzer')
  })

  it('does not open replacement reasons when replacements are blocked', () => {
    const html = renderDetail({
      canReplace: false,
      initialReplaceDialogOpen: true,
      replacementLimitNotice: <p>Heute schon gewechselt</p>,
    })

    expect(html).toContain('Andere Empfehlung')
    expect(html).toContain('Heute schon gewechselt')
    expect(html).not.toContain('Was passt gerade nicht?')
  })

  it('shows completed state without removing the detail content', () => {
    const html = renderDetail({ completed: true })

    expect(html).toContain('Erledigt')
    expect(html).toContain('Diese Übung hast du heute erledigt.')
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
    expect(html).not.toContain('Was passt gerade nicht?')
    expect(html).not.toContain('Zurücksetzen')
    expect(html).toContain('Zurück')
  })

  it('keeps the back action interactive', async () => {
    const onBack = vi.fn()
    await renderInteractiveDetail({ onBack })

    await clickButtonContaining('Zurück')

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('starts the timer from the primary action', async () => {
    await renderInteractiveDetail()

    await clickButtonContaining('Timer starten')

    expect(document.body.textContent).toContain('Pause')
    expect(document.body.textContent).not.toContain('Timer starten')
  })

  it('can still complete the exercise without the timer', async () => {
    const onComplete = vi.fn()
    await renderInteractiveDetail({ onComplete })

    await clickButtonContaining('Als erledigt markieren')

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('opens replacement reasons for open exercises', async () => {
    await renderInteractiveDetail()

    await clickButtonContaining('Andere Empfehlung')

    expect(document.body.textContent).toContain('Was passt gerade nicht?')
  })

  it('keeps blocked replacement attempts on the existing limit path', async () => {
    const onReplaceBlocked = vi.fn()
    await renderInteractiveDetail({
      canReplace: false,
      onReplaceBlocked,
      replacementLimitNotice: <p>Heute schon gewechselt</p>,
    })

    await clickButtonContaining('Andere Empfehlung')

    expect(onReplaceBlocked).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toContain('Heute schon gewechselt')
    expect(document.body.textContent).not.toContain('Was passt gerade nicht?')
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

async function renderInteractiveDetail(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <ExerciseDetailView
        completed={false}
        onBack={() => {}}
        onComplete={() => {}}
        onReplace={() => {}}
        section={section}
        {...props}
      />,
    )
  })

  return { container, root }
}

async function clickButtonContaining(label) {
  const button = [...document.querySelectorAll('button')].find((element) =>
    element.textContent.includes(label),
  )

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}
