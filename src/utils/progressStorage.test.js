import { describe, expect, it } from 'vitest'
import {
  calculateProgressSummary,
  getCompletedIdsForDate,
  getLocalDateKey,
  recordCompletion,
} from './progressStorage.js'

describe('progressStorage helpers', () => {
  it('stores completions by local date without duplicates', () => {
    const date = new Date(2026, 4, 10)
    const progress = recordCompletion(
      recordCompletion({ completedByDate: {} }, 'morning-mobility', date),
      'morning-mobility',
      date,
    )

    expect(getLocalDateKey(date)).toBe('2026-05-10')
    expect(getCompletedIdsForDate(progress, date)).toEqual(['morning-mobility'])
  })

  it('calculates today, weekly count, and streak', () => {
    const progress = {
      completedByDate: {
        '2026-05-08': ['a'],
        '2026-05-09': ['b', 'c'],
        '2026-05-10': ['d'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 10))).toEqual({
      completedToday: 1,
      completedThisWeek: 4,
      streak: 3,
    })
  })
})
