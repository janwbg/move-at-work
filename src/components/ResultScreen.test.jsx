// @vitest-environment happy-dom

import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createRecommendationFeedbackContext,
  preserveCompletedSections,
  preserveCompletedSectionsFromSnapshots,
  recordCompletedSectionSnapshot,
  recordVisiblePlanHistory,
  shouldShowCompleteDaySuccess,
} from './resultScreenHelpers.js'
import ResultScreen, { SuccessDialog } from './ResultScreen.jsx'
import {
  markCompleteDayCelebration,
  routineSettingsStorageKey,
} from '../utils/progressStorage.js'
import { loadRecommendationHistory } from '../utils/recommendationHistoryStorage.js'

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

    expect(html).toContain('Sitzphase unterbrochen.')
    expect(html).toContain('Schulter-Reset ist erledigt.')
    expect(html).toContain('Gut gemacht')
    expect(html).toContain('1/5')
    expect(html).toContain('Heute')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('>1</p>')
    expect(html).toContain('Hat diese Empfehlung gerade gepasst?')
  })

  it('renders feedback elements in the success dialog', () => {
    const html = renderSuccessDialog()

    expect(html).not.toContain('Wie fühlst du dich jetzt?')
    expect(html).not.toContain('War die Empfehlung hilfreich?')
    expect(html).toContain('Hat diese Empfehlung gerade gepasst?')
    expect(html).toContain('Ja, hat gepasst')
    expect(html).toContain('Eher nicht')
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

    expect(html).toContain('Sitzphase unterbrochen.')
    expect(html).toContain('5/5')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('>3</p>')
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

    await clickButtonContaining('Routine ansehen')

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

    expect(html).toContain('Heute eher')
    expect(html).toContain('<option value="meeting-heavy" selected="">Meetingtag</option>')
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

  it('records recommendation history only for the final visible plan', () => {
    const date = new Date(2026, 5, 25)
    const currentPlan = createPlan(['done-1', 'open-2'], [
      'completed-rule',
      'old-open-rule',
    ])
    const nextPlan = createPlan(['new-1', 'new-2'], [
      'temporary-rule',
      'new-open-rule',
    ])
    const finalPlan = preserveCompletedSections(currentPlan, nextPlan, ['done-1'])

    recordVisiblePlanHistory(finalPlan, date)

    expect(loadRecommendationHistory(date)).toEqual([
      {
        date: '2026-06-25',
        ruleIds: ['completed-rule', 'new-open-rule'],
      },
    ])
  })

  it('preserves completed recommendations from stored snapshots after remounts', () => {
    const currentPlan = createPlan(['done-1', 'done-2', 'open-3'])
    const nextPlan = createPlan(['new-1', 'new-2', 'new-3'])
    const snapshots = currentPlan.dailySchedule
      .slice(0, 2)
      .reduce(
        (currentSnapshots, section, index) =>
          recordCompletedSectionSnapshot(currentSnapshots, { index, section }),
        [],
      )
    const mergedPlan = preserveCompletedSectionsFromSnapshots(nextPlan, [
      'done-1',
      'done-2',
    ], snapshots)

    expect(mergedPlan.dailySchedule.map((section) => section.id)).toEqual([
      'done-1',
      'done-2',
      'new-3',
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
    expect(html).toContain('Geplant')
    expect(html).toContain('Plus ist aktuell vorbereitet, aber noch nicht kaufbar.')
  })

  it('navigates from the success dialog to the progress screen', async () => {
    await renderInteractiveResultScreen()

    await clickCompletionButton()

    expect(document.body.textContent).toContain('Sitzphase unterbrochen.')

    await clickButtonContaining('Routine ansehen')

    expect(document.body.textContent).toContain('Deine Routine')
    expect(document.body.textContent).toContain('Heute erledigt')
    expect(document.body.textContent).not.toContain('Sitzphase unterbrochen.')
  })

  it('keeps today and progress counts aligned after switching workplace', async () => {
    await renderInteractiveResultScreen({
      answers: createCompleteAnswers({
        workplaces: ['office', 'homeoffice'],
      }),
    })

    await clickCompletionButton()
    await clickButtonContaining('Zurück zum Tagesplan')

    expect(document.body.textContent).toContain('1/5')

    await clickButtonContaining('Homeoffice')
    await clickButtonContaining('Routine')

    expect(document.body.textContent).toContain('1/5')
    expect(document.body.textContent).toContain('Routine gehalten')
    expect(document.body.textContent).not.toContain('Microbreaks')
  })

  it('keeps completed today slots after profile settings change', async () => {
    await renderStatefulResultScreen({
      answers: createCompleteAnswers({
        workplaces: ['office', 'homeoffice'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['walking-pad'],
        },
      }),
    })

    await clickCompletionButton()
    await clickButtonContaining('Zurück zum Tagesplan')
    await clickCompletionButton()
    await clickButtonContaining('Zurück zum Tagesplan')

    expect(document.body.textContent).toContain('2/5')

    await clickButtonContaining('Einstellungen')
    await clickButtonContaining('Bearbeiten')

    const [, intensitySelect] = document.querySelectorAll('select')
    await changeSelect(intensitySelect, 'active')

    await clickButtonContaining('Heute')

    expect(document.body.textContent).toContain('2/5')
    expect(countOccurrences(document.body.textContent, 'Erledigt')).toBeGreaterThanOrEqual(2)
  })

  it('keeps completed today slots while navigating settings details', async () => {
    await renderStatefulResultScreen()

    await clickCompletionButton()
    await clickButtonContaining('Zurück zum Tagesplan')

    expect(document.body.textContent).toContain('1/5')

    await clickButtonContaining('Einstellungen')
    await clickButtonContaining('Bearbeiten')
    await clickButtonContaining('Zurück')
    await clickButtonContaining('Heute')

    expect(document.body.textContent).toContain('1/5')
    expect(document.body.textContent).toContain('Erledigt')
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
    expect(document.body.textContent).not.toContain('Nächster Impuls')

    await clickButtonContaining('Heute aktivieren')

    expect(document.body.textContent).toContain('Move at work Tag')
    expect(document.body.textContent).toContain('Heute pausieren')
    expect(document.body.textContent).toContain('Nächster Impuls')
    expect(JSON.parse(window.localStorage.getItem(routineSettingsStorageKey))).toEqual(
      inactiveTodaySettings,
    )
  })

  it('resets the daily workday context after a date change while open', async () => {
    vi.useFakeTimers()

    try {
      vi.setSystemTime(new Date(2026, 5, 17, 23, 59))
      window.localStorage.setItem(
        'move-at-work-daily-context',
        JSON.stringify({
          date: '2026-06-17',
          currentWorkdayType: 'focus-heavy',
        }),
      )

      await renderInteractiveResultScreen({
        answers: createCompleteAnswers({ situation: 'mixed-day' }),
      })

      expect(getWorkdaySelect().value).toBe('focus-heavy')

      vi.setSystemTime(new Date(2026, 5, 18, 0, 0))
      await act(async () => {
        vi.advanceTimersByTime(60 * 1000)
      })

      expect(getWorkdaySelect().value).toBe('mixed-day')
    } finally {
      vi.useRealTimers()
    }
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

async function renderStatefulResultScreen({ answers = createCompleteAnswers() } = {}) {
  function ResultHarness() {
    const [currentAnswers, setCurrentAnswers] = useState(answers)

    return (
      <ResultScreen
        answers={currentAnswers}
        onChangeAnswers={setCurrentAnswers}
        onRestartOnboarding={() => {}}
      />
    )
  }

  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(<ResultHarness />)
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

async function clickCompletionButton() {
  let button = [...document.querySelectorAll('button')].find(
    (element) => element.textContent.trim() === 'Erledigt' && !element.disabled,
  )

  if (!button) {
    await clickButtonContaining('Übung öffnen')
    button = [...document.querySelectorAll('button')].find((element) =>
      element.textContent.includes('Als erledigt markieren'),
    )
  }

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

async function changeSelect(select, value) {
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function countOccurrences(value, search) {
  return value.split(search).length - 1
}

function getWorkdaySelect() {
  return document.querySelector(
    'select[aria-label="Heutige Tagesart auswählen"]',
  )
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

function createPlan(ids, ruleIds = ids) {
  return {
    dailySchedule: ids.map((id, index) => ({
      id,
      ruleId: ruleIds[index],
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
