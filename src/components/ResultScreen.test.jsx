// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createRecommendationFeedbackContext,
  preserveCompletedSections,
  shouldShowCompleteDaySuccess,
} from './resultScreenHelpers.js'
import ResultScreen, { SuccessDialog } from './ResultScreen.jsx'
import {
  markCompleteDayCelebration,
  routineSettingsStorageKey,
} from '../utils/progressStorage.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const summary = {
  completedToday: 1,
  completedThisWeek: 1,
  streak: 1,
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('SuccessDialog', () => {
  it('shows a positive completion moment with exercise name and compact progress', () => {
    const html = renderSuccessDialog()

    expect(html).toContain('Stark gemacht!')
    expect(html).toContain('Schulter-Reset ist erledigt.')
    expect(html).toContain('Du hast heute 1 von 5 Übungen geschafft.')
    expect(html).toContain('1/5')
    expect(html).toContain('Heute')
    expect(html).toContain('🚀 1')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('Jede kurze Bewegung zählt.')
  })

  it('does not render feedback elements in the success dialog', () => {
    const html = renderSuccessDialog()

    expect(html).not.toContain('Wie fühlst du dich jetzt?')
    expect(html).not.toContain('Hat diese Empfehlung gerade gepasst?')
    expect(html).not.toContain('War die Empfehlung hilfreich?')
    expect(html).not.toContain('Feedback geben')
    expect(html).not.toContain('Ja, hat gepasst')
    expect(html).not.toContain('Eher nicht')
  })

  it('shows the complete-day success variant for 5 of 5', () => {
    const html = renderSuccessDialog({
      isCompleteDaySuccess: true,
      summary: {
        ...summary,
        completedToday: 5,
        streak: 3,
      },
      title: 'Tagesabschluss',
    })

    expect(html).toContain('Kompletter Tag geschafft!')
    expect(html).toContain('Du hast heute alle 5 Impulse abgeschlossen.')
    expect(html).toContain('5/5')
    expect(html).toContain('🚀 3')
    expect(html).toContain('Starker Arbeitstag. Deine Routine wächst.')
    expect(html).not.toContain('Tagesabschluss ist erledigt.')
  })

  it('keeps the return action interactive', async () => {
    const onClose = vi.fn()
    await renderInteractiveSuccessDialog({ onClose })

    await clickButtonContaining('Zurück zum Tagesplan')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('can call the progress action from the secondary button', async () => {
    const onOpenProgress = vi.fn()
    await renderInteractiveSuccessDialog({ onOpenProgress })

    await clickButtonContaining('Fortschritt ansehen')

    expect(onOpenProgress).toHaveBeenCalledTimes(1)
  })
})

describe('ResultScreen daily workday context helpers', () => {
  it('initializes the Today workday dropdown from the profile value', () => {
    const html = renderToStaticMarkup(
      <ResultScreen
        answers={createCompleteAnswers({ situation: 'meeting-heavy' })}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Art des heutigen Arbeitstags')
    expect(html).toContain('<option value="meeting-heavy" selected="">Meetings</option>')
    expect(html).toContain('self-start')
  })

  it('preserves completed recommendations and lets open slots refresh', () => {
    const currentPlan = createPlan(['done-1', 'open-2', 'done-3'])
    const nextPlan = createPlan(['new-1', 'new-2', 'new-3'])
    const mergedPlan = preserveCompletedSections(currentPlan, nextPlan, [
      'done-1',
      'done-3',
    ])

    expect(mergedPlan.dailySchedule.map((section) => section.id)).toEqual([
      'done-1',
      'new-2',
      'done-3',
    ])
  })

  it('stores the currently selected workday type in feedback context', () => {
    expect(
      createRecommendationFeedbackContext({
        activeWorkPhase: 'focus',
        activeWorkdayType: 'study-day',
        activeWorkplace: 'office',
        fallbackIntensity: 'balanced',
        section: {
          id: 'morning-neck-reset',
          intensity: 'Leicht',
          ruleId: 'neck-mobility-focus',
        },
      }),
    ).toMatchObject({
      recommendationId: 'neck-mobility-focus',
      scheduleSectionId: 'morning-neck-reset',
      workplace: 'office',
      currentWorkplace: 'office',
      phase: 'focus',
      currentPhase: 'focus',
      workdayType: 'study-day',
      intensity: 'Leicht',
    })
  })

  it('can render the upgrade view from the screen controller', () => {
    const html = renderToStaticMarkup(
      <ResultScreen
        answers={createCompleteAnswers()}
        initialActiveTab="upgrade"
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Move at work Plus')
    expect(html).toContain('2,99 € / Monat')
    expect(html).toContain('Plus wird vorbereitet')
  })

  it('navigates from the success dialog to the progress screen', async () => {
    await renderInteractiveResultScreen()

    await clickButtonContaining('Erledigt')

    expect(document.body.textContent).toContain('Stark gemacht!')

    await clickButtonContaining('Fortschritt ansehen')

    expect(document.body.textContent).toContain('Aktivitätskalender')
    expect(document.body.textContent).toContain('Heute')
    expect(document.body.textContent).not.toContain('Stark gemacht!')
  })

  it('keeps today and progress counts aligned after switching workplace', async () => {
    await renderInteractiveResultScreen({
      answers: createCompleteAnswers({
        workplaces: ['office', 'homeoffice'],
      }),
    })

    await clickButtonContaining('Erledigt')
    await clickButtonContaining('Zurück zum Tagesplan')

    expect(document.body.textContent).toContain('1/5')

    await clickButtonContaining('Homeoffice')
    await clickButtonContaining('Fortschritt')

    expect(document.body.textContent).toContain('1/5')
    expect(document.body.textContent).toContain('Routine gestartet')
    expect(document.body.textContent).not.toContain('Microbreaks')
  })

  it('respects inactive routine weekdays as pause days until today is activated', async () => {
    const today = new Date()
    const inactiveTodaySettings = {
      activeWeekdays: getWeekdaysExcept(today.getDay()),
    }
    window.localStorage.setItem(
      routineSettingsStorageKey,
      JSON.stringify(inactiveTodaySettings),
    )

    await renderInteractiveResultScreen()

    expect(document.body.textContent).toContain('Pausentag')
    expect(document.body.textContent).toContain('Heute aktivieren')
    expect(document.body.textContent).not.toContain('Jetzt passend')

    await clickButtonContaining('Heute aktivieren')

    expect(document.body.textContent).toContain('Move-at-work-Tag')
    expect(document.body.textContent).toContain('Heute pausieren')
    expect(document.body.textContent).toContain('Jetzt passend')
    expect(JSON.parse(window.localStorage.getItem(routineSettingsStorageKey))).toEqual(
      inactiveTodaySettings,
    )
  })

  it('detects the first 5 of 5 completion for the complete-day success', () => {
    const date = new Date(2026, 5, 24)

    expect(
      shouldShowCompleteDaySuccess({
        completedBefore: 4,
        date,
        progress: { completedByDate: {} },
        totalToday: 5,
      }),
    ).toBe(true)
  })

  it('does not show the complete-day success repeatedly for the same date', () => {
    const date = new Date(2026, 5, 24)
    const progress = markCompleteDayCelebration({ completedByDate: {} }, date)

    expect(
      shouldShowCompleteDaySuccess({
        completedBefore: 4,
        date,
        progress,
        totalToday: 5,
      }),
    ).toBe(false)
  })
})

function renderSuccessDialog(props = {}) {
  return renderToStaticMarkup(
    <SuccessDialog
      onClose={() => {}}
      summary={summary}
      title="Schulter-Reset"
      totalToday={5}
      {...props}
    />,
  )
}

async function renderInteractiveSuccessDialog(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <SuccessDialog
        onClose={() => {}}
        onOpenProgress={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
        {...props}
      />,
    )
  })

  return { container, root }
}

async function renderInteractiveResultScreen(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <ResultScreen
        answers={createCompleteAnswers()}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
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

function createCompleteAnswers(overrides = {}) {
  return {
    currentWorkplace: 'office',
    defaultWorkplace: 'office',
    fitnessLevel: 'balanced',
    goal: 'habit',
    situation: 'mixed-day',
    workplaces: ['office'],
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
    ...overrides,
  }
}

function createPlan(ids) {
  return {
    dailySchedule: ids.map((id, index) => ({
      id,
      slotId: `slot-${index + 1}`,
      title: `Empfehlung ${index + 1}`,
    })),
    movements: [],
    rhythm: '',
    summary: '',
  }
}

function getWeekdaysExcept(excludedWeekday) {
  return [0, 1, 2, 3, 4, 5, 6].filter((weekday) => weekday !== excludedWeekday)
}
