import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  createRecommendationFeedbackContext,
  preserveCompletedSections,
  shouldShowCompleteDaySuccess,
} from './resultScreenHelpers.js'
import ResultScreen, { SuccessDialog } from './ResultScreen.jsx'
import { markCompleteDayCelebration } from '../utils/progressStorage.js'

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

  it('shows the optional benefit check after completion', () => {
    const html = renderToStaticMarkup(
      <SuccessDialog
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )

    expect(html).toContain('Reset erledigt.')
    expect(html).toContain('Wie fühlst du dich jetzt?')
    expect(html).toContain('Wacher')
    expect(html).toContain('Entspannter')
    expect(html).toContain('Fokussierter')
    expect(html).toContain('Lockerer')
    expect(html).toContain('Kein Unterschied')
  })

  it('can mark an initial benefit answer as selected', () => {
    const html = renderToStaticMarkup(
      <SuccessDialog
        initialEffect="more-focused"
        onClose={() => {}}
        summary={summary}
        title="Schulter-Reset"
        totalToday={5}
      />,
    )

    expect(html).toMatch(/aria-pressed="true"[^>]*>Fokussierter<\/button>/)
  })

  it('shows the complete-day success variant for 5 of 5', () => {
    const html = renderToStaticMarkup(
      <SuccessDialog
        isCompleteDaySuccess
        onClose={() => {}}
        summary={{
          ...summary,
          completedToday: 5,
        }}
        title="Tagesabschluss"
        totalToday={5}
      />,
    )

    expect(html).toContain('Kompletter Tag geschafft.')
    expect(html).toContain('Du hast heute alle 5 Impulse abgeschlossen.')
    expect(html).not.toContain('Tagesabschluss ist abgehakt')
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
