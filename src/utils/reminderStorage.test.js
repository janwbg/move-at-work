import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDailyReminderState,
  getDefaultReminderSettings,
  getQuietUntilForPreset,
  loadDailyReminderState,
  loadReminderSettings,
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
    })

    expect(loadReminderSettings()).toEqual({
      enabled: true,
      mode: 'active',
      enabledWindows: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
      quietUntil: '2026-06-17T11:00:00.000Z',
    })
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
        snoozedSlots: {
          morning: '2026-06-17T10:45:00.000Z',
        },
        skippedSlots: ['lunch_transition'],
        lastReminderShownAt: {
          morning: '2026-06-17T09:45:00.000Z',
        },
      },
      date,
    )

    expect(loadDailyReminderState(date)).toEqual({
      date: '2026-06-17',
      snoozedSlots: {
        morning: '2026-06-17T10:45:00.000Z',
      },
      skippedSlots: ['lunch_transition'],
      lastReminderShownAt: {
        morning: '2026-06-17T09:45:00.000Z',
      },
    })
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
