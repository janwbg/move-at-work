import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDailyReminderState,
  getDefaultReminderSettings,
  getQuietUntilForPreset,
  loadDailyReminderState,
  loadReminderSettings,
  markReminderShown,
  normalizeDailyReminderState,
  normalizeReminderSettings,
  reminderModeWindowDefaults,
  reminderSettingsStorageKey,
  reminderStateStorageKey,
  saveDailyReminderState,
  saveReminderSettings,
} from './reminderStorage.js'

describe('reminderStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads default reminder settings', () => {
    expect(loadReminderSettings()).toEqual(getDefaultReminderSettings())
  })

  it('saves and loads reminder settings', () => {
    saveReminderSettings({
      enabled: true,
      mode: 'active',
      enabledWindows: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
      quietUntil: '2026-06-17T11:00:00.000Z',
      systemNotificationsEnabled: true,
    })

    expect(loadReminderSettings()).toEqual({
      enabled: true,
      mode: 'active',
      enabledWindows: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
      quietUntil: '2026-06-17T11:00:00.000Z',
      systemNotificationsEnabled: true,
    })
  })

  it.each([
    ['gentle', reminderModeWindowDefaults.gentle],
    ['normal', reminderModeWindowDefaults.normal],
    ['active', reminderModeWindowDefaults.active],
  ])('derives reminder windows from %s mode', (mode, expectedWindows) => {
    expect(
      normalizeReminderSettings({
        enabled: true,
        mode,
        enabledWindows: ['wrap_up'],
        quietUntil: null,
      }).enabledWindows,
    ).toEqual(expectedWindows)
  })

  it('normalizes old stored enabled windows to the selected mode', () => {
    window.localStorage.setItem(
      reminderSettingsStorageKey,
      JSON.stringify({
        enabled: true,
        mode: 'normal',
        enabledWindows: ['morning', 'lunch_transition', 'wrap_up'],
        quietUntil: null,
      }),
    )

    expect(loadReminderSettings().enabledWindows).toEqual([
      'morning',
      'afternoon',
    ])
  })

  it('migrates the old standard mode to normal', () => {
    expect(
      normalizeReminderSettings({
        enabled: true,
        mode: 'standard',
        enabledWindows: ['morning', 'afternoon'],
        quietUntil: null,
      }),
    ).toMatchObject({
      mode: 'normal',
      enabledWindows: reminderModeWindowDefaults.normal,
    })
  })

  it('normalizes old settings without system notification preference', () => {
    expect(
      normalizeReminderSettings({
        enabled: true,
        mode: 'normal',
        enabledWindows: ['morning'],
        quietUntil: null,
      }).systemNotificationsEnabled,
    ).toBe(false)
  })

  it('falls back to defaults for invalid reminder settings', () => {
    window.localStorage.setItem(reminderSettingsStorageKey, '{')
    expect(loadReminderSettings()).toEqual(getDefaultReminderSettings())

    window.localStorage.setItem(reminderSettingsStorageKey, JSON.stringify('bad'))
    expect(loadReminderSettings()).toEqual(getDefaultReminderSettings())
  })

  it('keeps daily reminder state date-specific', () => {
    const date = new Date(2026, 5, 17, 9, 45)

    saveDailyReminderState(
      {
        date: '2026-06-17',
        lastCompletedAt: '2026-06-17T09:40:00.000Z',
        lastInteractionAt: '2026-06-17T09:45:00.000Z',
        snoozedSlots: {
          morning: '2026-06-17T10:45:00.000Z',
        },
        snoozeCounts: {
          morning: 2,
        },
        pausedForDay: true,
        skippedSlots: ['lunch_transition'],
        skipCounts: {
          lunch_transition: 1,
        },
        lastReminderShownAt: {
          morning: '2026-06-17T09:45:00.000Z',
        },
        reminderShownCount: 4,
      },
      date,
    )

    expect(loadDailyReminderState(date)).toEqual({
      date: '2026-06-17',
      lastCompletedAt: '2026-06-17T09:40:00.000Z',
      lastInteractionAt: '2026-06-17T09:45:00.000Z',
      snoozedSlots: {
        morning: '2026-06-17T10:45:00.000Z',
      },
      snoozeCounts: {
        morning: 2,
      },
      pausedForDay: true,
      skippedSlots: ['lunch_transition'],
      skipCounts: {
        lunch_transition: 1,
      },
      lastReminderShownAt: {
        morning: '2026-06-17T09:45:00.000Z',
      },
      reminderShownCount: 4,
    })
  })

  it('counts repeated reminder showings for the daily reminder limit', () => {
    const date = new Date(2026, 5, 17, 9, 45)
    const firstState = markReminderShown(createDailyReminderState(date), 'morning', date)
    const secondState = markReminderShown(
      firstState,
      'morning',
      new Date(2026, 5, 17, 10, 20),
    )

    expect(secondState.lastReminderShownAt.morning).toBe(
      new Date(2026, 5, 17, 10, 20).toISOString(),
    )
    expect(secondState.reminderShownCount).toBe(2)
  })

  it('migrates old daily reminder state without a shown count', () => {
    const date = new Date(2026, 5, 17, 9, 45)
    const oldState = {
      date: '2026-06-17',
      lastReminderShownAt: {
        morning: date.toISOString(),
        afternoon: new Date(2026, 5, 17, 14, 30).toISOString(),
      },
    }

    expect(normalizeDailyReminderState(oldState, date).reminderShownCount).toBe(2)
    expect(
      normalizeDailyReminderState(
        { ...oldState, reminderShownCount: 1 },
        date,
      ).reminderShownCount,
    ).toBe(2)
  })

  it('does not carry an old daily state into a new date', () => {
    window.localStorage.setItem(
      reminderStateStorageKey,
      JSON.stringify({
        date: '2026-06-16',
        snoozedSlots: {
          morning: '2026-06-16T10:45:00.000Z',
        },
        skippedSlots: ['afternoon'],
        lastReminderShownAt: {},
      }),
    )

    expect(loadDailyReminderState(new Date(2026, 5, 17, 9, 45))).toEqual(
      createDailyReminderState(new Date(2026, 5, 17, 9, 45)),
    )
  })

  it('creates quiet-until timestamps for the supported pause presets', () => {
    const now = new Date(2026, 5, 17, 9, 30)

    expect(new Date(getQuietUntilForPreset('one-hour', now)).getHours()).toBe(10)
    expect(new Date(getQuietUntilForPreset('today', now)).getHours()).toBe(23)
    expect(new Date(getQuietUntilForPreset('tomorrow', now)).getDate()).toBe(18)
    expect(new Date(getQuietUntilForPreset('tomorrow', now)).getHours()).toBe(8)
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
