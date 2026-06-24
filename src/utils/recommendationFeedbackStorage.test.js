import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadRecommendationFeedback,
  recordRecommendationFeedback,
  saveRecommendationFeedback,
  summarizeRecommendationFeedback,
} from './recommendationFeedbackStorage.js'

describe('recommendationFeedbackStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores feedback locally with recommendation context', () => {
    const feedback = recordRecommendationFeedback(
      {
        recommendationId: 'office-neck-reset',
        currentWorkplace: 'office',
        currentPhase: 'focus',
        workdayType: 'focus-heavy',
        intensity: 'Leicht',
        feedback: 'not-fit',
        reason: 'Zu auffällig',
      },
      new Date(2026, 4, 13),
    )

    expect(feedback).toEqual([
      {
        recommendationId: 'office-neck-reset',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        phase: 'focus',
        currentPhase: 'focus',
        workdayType: 'focus-heavy',
        intensity: 'Leicht',
        feedback: 'not-fit',
        reason: 'Zu auffällig',
      },
    ])
  })

  it('reads stored feedback and summarizes it', () => {
    saveRecommendationFeedback([
      {
        recommendationId: 'a',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        workdayType: 'mixed-day',
        intensity: 'Leicht',
        feedback: 'fit',
      },
      {
        recommendationId: 'b',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        workdayType: 'mixed-day',
        intensity: 'Mittel',
        feedback: 'not-fit',
        reason: 'Keine Zeit',
      },
      {
        recommendationId: 'c',
        date: '2026-05-14',
        workplace: 'homeoffice',
        currentWorkplace: 'homeoffice',
        workdayType: 'meeting-heavy',
        intensity: 'Mittel',
        feedback: 'not-fit',
        reason: 'Keine Zeit',
      },
    ])

    expect(loadRecommendationFeedback()).toHaveLength(3)
    expect(summarizeRecommendationFeedback(loadRecommendationFeedback())).toEqual({
      total: 3,
      fit: 1,
      notFit: 2,
      mostCommonReason: 'Keine Zeit',
      benefitTotal: 0,
      positiveBenefitCount: 0,
    })
  })

  it('stores benefit feedback with stable internal keys', () => {
    const feedback = recordRecommendationFeedback(
      {
        recommendationId: 'office-neck-reset',
        currentWorkplace: 'office',
        currentPhase: 'focus',
        workdayType: 'focus-heavy',
        intensity: 'Leicht',
        effect: 'more-awake',
      },
      new Date(2026, 4, 13),
    )

    expect(feedback).toEqual([
      {
        recommendationId: 'office-neck-reset',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        phase: 'focus',
        currentPhase: 'focus',
        workdayType: 'focus-heavy',
        intensity: 'Leicht',
        effect: 'more-awake',
      },
    ])
    expect(summarizeRecommendationFeedback(feedback)).toMatchObject({
      benefitTotal: 1,
      positiveBenefitCount: 1,
    })
  })

  it('merges fit feedback and benefit feedback for the same recommendation', () => {
    recordRecommendationFeedback(
      {
        recommendationId: 'office-neck-reset',
        currentWorkplace: 'office',
        currentPhase: 'focus',
        feedback: 'fit',
        slotId: 'morning',
      },
      new Date(2026, 4, 13),
    )
    const feedback = recordRecommendationFeedback(
      {
        recommendationId: 'office-neck-reset',
        currentWorkplace: 'office',
        currentPhase: 'focus',
        effect: 'more-focused',
        slotId: 'morning',
      },
      new Date(2026, 4, 13),
    )

    expect(feedback).toHaveLength(1)
    expect(feedback[0]).toMatchObject({
      feedback: 'fit',
      effect: 'more-focused',
    })
  })

  it('stores replacement reasons as not-fit feedback with replacement action', () => {
    const feedback = recordRecommendationFeedback(
      {
        recommendationId: 'meeting-posture-switch',
        currentWorkplace: 'office',
        currentPhase: 'meeting',
        workdayType: 'meeting-heavy',
        intensity: 'Leicht',
        feedback: 'not-fit',
        reason: 'meeting',
        replacementReason: 'meeting',
        replacementRecommendationId: 'box-breathing-focus',
        slotId: 'morning',
        action: 'replaced',
      },
      new Date(2026, 4, 13),
    )

    expect(feedback[0]).toMatchObject({
      recommendationId: 'meeting-posture-switch',
      date: '2026-05-13',
      workplace: 'office',
      currentWorkplace: 'office',
      phase: 'meeting',
      currentPhase: 'meeting',
      workdayType: 'meeting-heavy',
      intensity: 'Leicht',
      feedback: 'not-fit',
      reason: 'meeting',
      replacementReason: 'meeting',
      replacementRecommendationId: 'box-breathing-focus',
      slotId: 'morning',
      action: 'replaced',
    })
  })

  it('keeps old feedback entries without action readable', () => {
    saveRecommendationFeedback([
      {
        recommendationId: 'old-entry',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        feedback: 'not-fit',
        reason: 'Keine Zeit',
      },
    ])

    expect(loadRecommendationFeedback()).toEqual([
      {
        recommendationId: 'old-entry',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        feedback: 'not-fit',
        reason: 'Keine Zeit',
      },
    ])
  })

  it('keeps old feedback entries without benefit feedback readable', () => {
    saveRecommendationFeedback([
      {
        recommendationId: 'old-entry',
        date: '2026-05-13',
        workplace: 'office',
        currentWorkplace: 'office',
        feedback: 'fit',
      },
    ])

    expect(loadRecommendationFeedback()[0].effect).toBeUndefined()
    expect(summarizeRecommendationFeedback(loadRecommendationFeedback())).toMatchObject({
      benefitTotal: 0,
      positiveBenefitCount: 0,
    })
  })

  it('ignores invalid benefit feedback values without crashing', () => {
    const feedback = recordRecommendationFeedback(
      {
        recommendationId: 'office-neck-reset',
        currentWorkplace: 'office',
        currentPhase: 'focus',
        effect: 'superhuman-focus',
      },
      new Date(2026, 4, 13),
    )

    expect(feedback).toEqual([])
  })

  it('does not break on invalid or empty localStorage data', () => {
    expect(loadRecommendationFeedback()).toEqual([])

    window.localStorage.setItem('move-at-work-recommendation-feedback', '{')
    expect(loadRecommendationFeedback()).toEqual([])

    window.localStorage.setItem(
      'move-at-work-recommendation-feedback',
      JSON.stringify({ feedback: 'fit' }),
    )
    expect(loadRecommendationFeedback()).toEqual([])

    window.localStorage.setItem(
      'move-at-work-recommendation-feedback',
      JSON.stringify([
        {
          recommendationId: 'bad-effect',
          date: '2026-05-13',
          effect: 'not-real',
        },
      ]),
    )
    expect(loadRecommendationFeedback()).toEqual([])
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
