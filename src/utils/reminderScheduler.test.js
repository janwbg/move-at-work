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

const enabledStandardSettings = {
  enabled: true,
  mode: 'standard',
  enabledWindows: ['morning', 'afternoon'],
  quietUntil: null,
}

describe('reminderScheduler', () => {
  it('does not show reminders when reminders are disabled', () => {
    expect(
      getDueReminder({
        now: dateAt(9, 45),
        plan,
        settings: { ...enabledStandardSettings, enabled: false },
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
          ...enabledStandardSettings,
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
        settings: enabledStandardSettings,
      }),
    ).toBeNull()
  })

  it('does not remind for the start slot by default', () => {
    expect(getReminderAt(8, 15)).toBeNull()
  })

  it('supports morning and afternoon in standard mode', () => {
    expect(getReminderAt(9, 45)?.slotId).toBe('morning')
    expect(
      getReminderAt(14, 30, { completedIds: ['morning-id'] })?.slotId,
    ).toBe('afternoon')
  })
})

function getReminderAt(hours, minutes, overrides = {}) {
  const now = dateAt(hours, minutes)

  return getDueReminder({
    completedIds: overrides.completedIds ?? [],
    now,
    plan,
    settings: overrides.settings ?? enabledStandardSettings,
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
