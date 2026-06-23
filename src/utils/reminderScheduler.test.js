import { describe, expect, it } from 'vitest'
import { getDueReminder } from './reminderScheduler.js'
import { createDailyReminderState } from './reminderStorage.js'

const plan = {
  dailySchedule: [
    createSection('start', 'Start', '08:00', '08:45'),
    createSection('morning', 'Vormittag', '09:30', '10:30'),
    createSection('lunch_transition', 'Mittag', '12:00', '13:30'),
    createSection('afternoon', 'Nachmittag', '14:00', '15:15'),
    createSection('wrap_up', 'Tagesabschluss', '16:15', '17:00'),
  ],
}

const enabledNormalSettings = {
  enabled: true,
  mode: 'normal',
  enabledWindows: ['morning', 'afternoon'],
  quietUntil: null,
}

describe('reminderScheduler', () => {
  it('does not show reminders when reminders are disabled', () => {
    expect(
      getDueReminder({
        now: dateAt(9, 45),
        plan,
        settings: { ...enabledNormalSettings, enabled: false },
        state: createDailyReminderState(dateAt(9, 45)),
      }),
    ).toBeNull()
  })

  it('does not show reminders while quietUntil is in the future', () => {
    expect(
      getDueReminder({
        now: dateAt(9, 45),
        plan,
        settings: {
          ...enabledNormalSettings,
          quietUntil: dateAt(11, 0).toISOString(),
        },
        state: createDailyReminderState(dateAt(9, 45)),
      }),
    ).toBeNull()
  })

  it('shows a reminder when the current active window is open', () => {
    expect(getReminderAt(9, 45)?.slotId).toBe('morning')
  })

  it('does not show reminders for completed slots', () => {
    expect(getReminderAt(9, 45, { completedIds: ['morning-id'] })).toBeNull()
  })

  it('does not show reminders for skipped slots', () => {
    expect(
      getReminderAt(9, 45, {
        state: {
          date: '2026-06-17',
          snoozedSlots: {},
          skippedSlots: ['morning'],
          lastReminderShownAt: {},
        },
      }),
    ).toBeNull()
  })

  it('does not show reminders when the slot is still snoozed', () => {
    expect(
      getReminderAt(9, 45, {
        state: {
          date: '2026-06-17',
          snoozedSlots: {
            morning: dateAt(10, 45).toISOString(),
          },
          skippedSlots: [],
          lastReminderShownAt: {},
        },
      }),
    ).toBeNull()
  })

  it('shows reminders again when a snooze time has been reached', () => {
    expect(
      getReminderAt(11, 0, {
        state: {
          date: '2026-06-17',
          snoozedSlots: {
            morning: dateAt(10, 45).toISOString(),
          },
          skippedSlots: [],
          lastReminderShownAt: {},
        },
      })?.slotId,
    ).toBe('morning')
  })

  it('only considers enabled windows', () => {
    expect(
      getReminderAt(12, 30, {
        settings: enabledNormalSettings,
      }),
    ).toBeNull()
  })

  it('does not remind for the start slot by default', () => {
    expect(getReminderAt(8, 15)).toBeNull()
  })

  it('supports morning and afternoon in normal mode', () => {
    expect(getReminderAt(9, 45)?.slotId).toBe('morning')
    expect(
      getReminderAt(14, 30, { completedIds: ['morning-id'] })?.slotId,
    ).toBe('afternoon')
  })

  it('uses longer cool downs in gentle mode and shorter cool downs in active mode', () => {
    const recentlyShownState = {
      ...createDailyReminderState(dateAt(10, 20)),
      lastReminderShownAt: {
        morning: dateAt(9, 45).toISOString(),
      },
    }

    expect(
      getReminderAt(10, 20, {
        settings: {
          enabled: true,
          mode: 'gentle',
          enabledWindows: ['morning'],
          quietUntil: null,
        },
        state: recentlyShownState,
      }),
    ).toBeNull()
    expect(
      getReminderAt(10, 20, {
        settings: {
          enabled: true,
          mode: 'active',
          enabledWindows: ['morning'],
          quietUntil: null,
        },
        state: recentlyShownState,
      })?.slotId,
    ).toBe('morning')
  })

  it('reduces reminders after repeated snoozing on the same day', () => {
    expect(
      getReminderAt(14, 30, {
        completedIds: ['morning-id'],
        state: {
          ...createDailyReminderState(dateAt(14, 30)),
          lastInteractionAt: dateAt(13, 30).toISOString(),
          snoozeCounts: {
            morning: 3,
          },
        },
      }),
    ).toBeNull()
  })

  it('reduces reminders after repeated skipping on the same day', () => {
    expect(
      getReminderAt(14, 30, {
        completedIds: ['morning-id'],
        state: {
          ...createDailyReminderState(dateAt(14, 30)),
          lastInteractionAt: dateAt(13, 30).toISOString(),
          skipCounts: {
            morning: 3,
          },
        },
      }),
    ).toBeNull()
  })

  it('keeps today-not-more active for the rest of the day', () => {
    expect(
      getReminderAt(14, 30, {
        completedIds: ['morning-id'],
        state: {
          ...createDailyReminderState(dateAt(14, 30)),
          pausedForDay: true,
        },
      }),
    ).toBeNull()
  })

  it('does not show another reminder directly after a completed exercise', () => {
    expect(
      getReminderAt(14, 30, {
        completedIds: ['morning-id'],
        state: {
          ...createDailyReminderState(dateAt(14, 30)),
          lastCompletedAt: dateAt(14, 10).toISOString(),
        },
      }),
    ).toBeNull()
  })

  it('derives active windows from reminder mode even with old stored windows', () => {
    expect(
      getReminderAt(12, 30, {
        completedIds: ['morning-id'],
        settings: {
          enabled: true,
          mode: 'gentle',
          enabledWindows: ['lunch_transition', 'wrap_up'],
          quietUntil: null,
        },
      }),
    ).toBeNull()
    expect(
      getReminderAt(12, 30, {
        completedIds: ['morning-id'],
        settings: {
          enabled: true,
          mode: 'active',
          enabledWindows: ['morning'],
          quietUntil: null,
        },
      })?.slotId,
    ).toBe('lunch_transition')
  })
})

function getReminderAt(hours, minutes, overrides = {}) {
  const now = dateAt(hours, minutes)

  return getDueReminder({
    completedIds: overrides.completedIds ?? [],
    now,
    plan,
        settings: overrides.settings ?? enabledNormalSettings,
    state: overrides.state ?? createDailyReminderState(now),
  })
}

function createSection(slotId, slotLabel, startTime, endTime) {
  return {
    duration: '2 Minuten',
    id: `${slotId}-id`,
    slotId,
    slotLabel,
    slotWindowMeta: {
      startTime,
      endTime,
    },
    timeLabel: slotLabel,
    title: `${slotLabel} Impuls`,
  }
}

function dateAt(hours, minutes) {
  return new Date(2026, 5, 17, hours, minutes)
}
