import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateProgressSummary,
  getDefaultRoutineSettings,
  getCompletedIdsForDate,
  getLocalDateKey,
  getRoutineCalendarDays,
  getRoutineDayStatus,
  hasCompleteDayCelebration,
  loadRoutineSettings,
  markCompleteDayCelebration,
  normalizeRoutineSettings,
  recordCompletion,
  routineSettingsStorageKey,
  saveRoutineSettings,
  setPauseDay,
} from './progressStorage.js'

describe('progressStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

    expect(calculateProgressSummary(progress, new Date(2026, 4, 13))).toMatchObject({
      completedToday: 2,
      completedThisWeek: 4,
      routineWeek: {
        completedDays: 3,
        plannedDays: 3,
      },
      streak: 3,
      todayStatus: {
        id: 'held',
        label: 'Routine gehalten',
      },
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

  it('uses Monday to Friday as the default active routine', () => {
    expect(getDefaultRoutineSettings()).toEqual({
      activeWeekdays: [1, 2, 3, 4, 5],
    })
    expect(loadRoutineSettings()).toEqual({
      activeWeekdays: [1, 2, 3, 4, 5],
    })
  })

  it('saves changed active weekdays locally', () => {
    saveRoutineSettings({ activeWeekdays: [3, 4, 5, 6, 0] })

    expect(loadRoutineSettings()).toEqual({
      activeWeekdays: [3, 4, 5, 6, 0],
    })
  })

  it('keeps at least one active day selected through normalization', () => {
    expect(normalizeRoutineSettings({ activeWeekdays: [] })).toEqual(
      getDefaultRoutineSettings(),
    )
  })

  it('falls back to defaults for invalid stored routine settings', () => {
    window.localStorage.setItem(routineSettingsStorageKey, '{')
    expect(loadRoutineSettings()).toEqual(getDefaultRoutineSettings())

    window.localStorage.setItem(
      routineSettingsStorageKey,
      JSON.stringify({ activeWeekdays: ['Mo', 9] }),
    )
    expect(loadRoutineSettings()).toEqual(getDefaultRoutineSettings())
  })

  it('keeps pause days neutral for the routine streak', () => {
    const progress = setPauseDay(
      {
        completedByDate: {
          '2026-05-12': ['tuesday'],
          '2026-05-14': ['thursday'],
        },
      },
      new Date(2026, 4, 13),
      true,
    )

    expect(calculateProgressSummary(progress, new Date(2026, 4, 14)).streak).toBe(2)
    expect(
      calculateProgressSummary(progress, new Date(2026, 4, 14)).routineWeek,
    ).toEqual({
      completedDays: 2,
      plannedDays: 3,
    })
  })

  it('pauses and reactivates only the selected local date', () => {
    const firstDate = new Date(2026, 4, 13)
    const secondDate = new Date(2026, 4, 14)
    const pausedProgress = setPauseDay(
      setPauseDay({ completedByDate: {} }, firstDate, true),
      secondDate,
      true,
    )
    const reactivatedProgress = setPauseDay(pausedProgress, firstDate, false)

    expect(getRoutineDayStatus({ date: firstDate, progress: pausedProgress }).id).toBe(
      'pause',
    )
    expect(getRoutineDayStatus({ date: secondDate, progress: pausedProgress }).id).toBe(
      'pause',
    )
    expect(
      getRoutineDayStatus({ date: firstDate, progress: reactivatedProgress }).id,
    ).toBe('missed')
    expect(
      getRoutineDayStatus({ date: secondDate, progress: reactivatedProgress }).id,
    ).toBe('pause')
  })

  it('keeps weekends neutral when they are not active', () => {
    const progress = {
      completedByDate: {
        '2026-05-08': ['friday'],
        '2026-05-11': ['monday'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 11)).streak).toBe(2)
  })

  it('supports a custom Wednesday to Sunday routine', () => {
    const routineSettings = { activeWeekdays: [3, 4, 5, 6, 0] }
    const progress = {
      completedByDate: {
        '2026-05-10': ['sunday'],
        '2026-05-13': ['wednesday'],
      },
    }

    expect(
      calculateProgressSummary(
        progress,
        new Date(2026, 4, 12),
        routineSettings,
      ).streak,
    ).toBe(1)
    expect(
      calculateProgressSummary(
        progress,
        new Date(2026, 4, 13),
        routineSettings,
      ).streak,
    ).toBe(2)
  })

  it.each([
    [1, 'held', 'Routine gehalten'],
    [3, 'strong', 'Starker Tag'],
    [5, 'complete', 'Kompletter Tag'],
  ])('classifies %i completed recommendations', (count, id, label) => {
    const date = new Date(2026, 4, 13)
    const progress = {
      completedByDate: {
        '2026-05-13': Array.from({ length: count }, (_, index) => `done-${index}`),
      },
    }

    expect(getRoutineDayStatus({ date, progress })).toMatchObject({ id, label })
  })

  it('builds a compact routine calendar with the last 28 days', () => {
    const progress = setPauseDay(
      {
        completedByDate: {
          '2026-05-11': ['held'],
          '2026-05-12': ['a', 'b', 'c'],
          '2026-05-13': ['a', 'b', 'c', 'd', 'e'],
        },
      },
      new Date(2026, 4, 14),
      true,
    )
    const calendarDays = getRoutineCalendarDays({
      date: new Date(2026, 4, 15),
      progress,
    })
    const statusesByDate = Object.fromEntries(
      calendarDays.map((day) => [day.date, day.status.id]),
    )

    expect(calendarDays).toHaveLength(28)
    expect(calendarDays.at(-1)).toMatchObject({
      date: '2026-05-15',
      isToday: true,
    })
    expect(statusesByDate['2026-05-10']).toBe('neutral')
    expect(statusesByDate['2026-05-11']).toBe('held')
    expect(statusesByDate['2026-05-12']).toBe('strong')
    expect(statusesByDate['2026-05-13']).toBe('complete')
    expect(statusesByDate['2026-05-14']).toBe('pause')
    expect(statusesByDate['2026-05-15']).toBe('open')
    expect(statusesByDate['2026-05-09']).toBe('neutral')
    expect(statusesByDate['2026-05-08']).toBe('missed')
  })

  it('remembers when the complete-day success was shown for a date', () => {
    const date = new Date(2026, 4, 13)
    const progress = markCompleteDayCelebration({ completedByDate: {} }, date)

    expect(hasCompleteDayCelebration(progress, date)).toBe(true)
    expect(hasCompleteDayCelebration(progress, new Date(2026, 4, 14))).toBe(false)
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

  it('breaks the routine after a missed active day', () => {
    const progress = {
      completedByDate: {
        '2026-05-11': ['monday'],
        '2026-05-13': ['wednesday'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 13)).streak).toBe(1)
  })

  it('does not break the routine after a neutral day', () => {
    const progress = {
      completedByDate: {
        '2026-05-08': ['friday'],
        '2026-05-11': ['monday'],
      },
    }

    expect(calculateProgressSummary(progress, new Date(2026, 4, 11)).streak).toBe(2)
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
