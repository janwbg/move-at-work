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

  it('calculates today, workweek count, and work streak', () => {
    const progress = {
      completedByDate: {
        '2026-05-11': ['a'],
        '2026-05-12': ['b'],
        '2026-05-13': ['c', 'd'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 13))).toEqual({
      completedToday: 2,
      completedThisWeek: 4,
      streak: 3,
    })
  })

  it('treats weekends as neutral for the work streak', () => {
    const progress = {
      completedByDate: {
        '2026-05-08': ['friday'],
        '2026-05-11': ['monday'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 11)).streak).toBe(2)
    expect(calculateProgressSummary(progress, new Date(2026, 4, 10)).streak).toBe(1)
  })

  it('breaks the work streak when a weekday has no completion', () => {
    const progress = {
      completedByDate: {
        '2026-05-08': ['friday'],
        '2026-05-12': ['tuesday'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 12)).streak).toBe(1)
  })
})
