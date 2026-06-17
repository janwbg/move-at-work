import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDailyContext, saveDailyContext } from './dailyContextStorage.js'

describe('dailyContextStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores the selected workday type for the current date', () => {
    saveDailyContext(
      {
        currentWorkdayType: 'study-day',
      },
      new Date(2026, 4, 13),
    )

    expect(loadDailyContext(new Date(2026, 4, 13))).toEqual({
      date: '2026-05-13',
      currentWorkdayType: 'study-day',
    })
  })

  it('ignores daily context from another date', () => {
    saveDailyContext(
      {
        currentWorkdayType: 'tight-schedule',
      },
      new Date(2026, 4, 13),
    )

    expect(loadDailyContext(new Date(2026, 4, 14))).toBeNull()
  })

  it('ignores invalid or broken stored context', () => {
    window.localStorage.setItem(
      'move-at-work-daily-context',
      JSON.stringify({
        date: '2026-05-13',
        currentWorkdayType: 'unknown',
      }),
    )

    expect(loadDailyContext(new Date(2026, 4, 13))).toBeNull()

    window.localStorage.setItem('move-at-work-daily-context', '{')
    expect(loadDailyContext(new Date(2026, 4, 13))).toBeNull()
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
