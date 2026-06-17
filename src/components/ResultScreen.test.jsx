import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  createRecommendationFeedbackContext,
  preserveCompletedSections,
} from './resultScreenHelpers.js'
import ResultScreen, { SuccessDialog } from './ResultScreen.jsx'

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
  it('initializes the Today workday switch from the profile value', () => {
    const html = renderToStaticMarkup(
      <ResultScreen
        answers={createCompleteAnswers({ situation: 'meeting-heavy' })}
        onChangeAnswers={() => {}}
        onRestartOnboarding={() => {}}
      />,
    )

    expect(html).toContain('Heute eher')
    expect(html).toMatch(/aria-pressed="true"[^>]*>Meetings<\/button>/)
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
