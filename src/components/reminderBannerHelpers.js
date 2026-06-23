import { getLaterTodaySnoozeUntil } from '../utils/reminderScheduler.js'
import {
  markReminderShown,
  pauseRemindersForDay,
  skipReminderSlot,
  snoozeReminderState,
  snoozeReminderStateUntil,
} from '../utils/reminderStorage.js'

export function getReminderCopy({
  activeWorkdayType = 'mixed-day',
  activeWorkplace,
  reminder,
}) {
  const copies = {
    'focus-heavy': {
      title: 'Passt gerade ein kurzer Reset?',
      text: 'Nur 60 Sekunden, falls es gerade in deine Fokusphase passt.',
    },
    'meeting-heavy': {
      title: 'Zwischen zwei Terminen?',
      text: 'Ein kurzer, diskreter Impuls wartet, falls der Moment passt.',
    },
    'mixed-day': {
      title: 'Kleiner Wechselmoment?',
      text: `${getSlotImpulseLabel(reminder)} ist noch offen, wenn es gerade reinpasst.`,
    },
    'study-day': {
      title: 'Kurzer Lern-Reset?',
      text: 'Ein ruhiger Wechsel kann warten, bis es in deinen Lernfluss passt.',
    },
    'tight-schedule': {
      title: 'Nur kurz, falls es passt.',
      text: 'Heute lieber etwas ruhiger? Du kannst die Impulse pausieren.',
    },
  }

  return {
    ...(copies[activeWorkdayType] ?? copies['mixed-day']),
    contextHint: getReminderContextHint({ activeWorkplace, reminder }),
  }
}

export function getReminderNotificationCopy({
  activeWorkdayType = 'mixed-day',
} = {}) {
  const copies = {
    'focus-heavy': {
      title: 'Passt gerade ein kurzer Reset?',
      body: 'Nur 60 Sekunden, falls es gerade reinpasst.',
    },
    'meeting-heavy': {
      title: 'Zwischen zwei Terminen?',
      body: 'Ein kurzer, diskreter Impuls wartet, falls der Moment passt.',
    },
    'mixed-day': {
      title: 'Kleiner Wechselmoment?',
      body: 'Dein nächster Impuls ist offen, wenn es gerade passt.',
    },
    'study-day': {
      title: 'Kurzer Lern-Reset?',
      body: 'Ein ruhiger Wechsel wartet, falls er gerade passt.',
    },
    'tight-schedule': {
      title: 'Nur kurz, falls es passt.',
      body: 'Du kannst die Impulse heute auch pausieren.',
    },
  }

  return copies[activeWorkdayType] ?? copies['mixed-day']
}

export function applyReminderBannerAction({
  action,
  now = new Date(),
  reminder,
  settings,
  state,
}) {
  if (!reminder) {
    return null
  }

  if (action === 'open') {
    return {
      detailIndex: reminder.index,
      state: markReminderShown(state, reminder.slotId, now),
    }
  }

  if (action === 'snooze-15') {
    return {
      state: snoozeReminderState(state, reminder.slotId, 15, now),
    }
  }

  if (action === 'snooze-30') {
    return {
      state: snoozeReminderState(state, reminder.slotId, 30, now),
    }
  }

  if (action === 'later-today') {
    const snoozedUntil = getLaterTodaySnoozeUntil({
      currentSlotId: reminder.slotId,
      now,
      settings,
    })

    return {
      state: snoozedUntil
        ? snoozeReminderStateUntil(state, reminder.slotId, snoozedUntil, now)
        : skipReminderSlot(state, reminder.slotId, now),
    }
  }

  if (action === 'skip-today') {
    return {
      state: pauseRemindersForDay(
        skipReminderSlot(state, reminder.slotId, now),
        now,
      ),
    }
  }

  return null
}

function getSlotImpulseLabel(reminder) {
  const labels = {
    afternoon: 'Dein Nachmittagsimpuls',
    lunch_transition: 'Dein Mittagsimpuls',
    morning: 'Dein Vormittagsimpuls',
    wrap_up: 'Dein Tagesabschlussimpuls',
  }

  return labels[reminder?.slotId] ?? 'Dein nächster Bewegungsimpuls'
}

function getReminderContextHint({ activeWorkplace, reminder }) {
  const setupHint = getSetupReminderHint(reminder)

  if (setupHint) {
    return setupHint
  }

  if (activeWorkplace === 'office') {
    return 'Diskret am Arbeitsplatz möglich.'
  }

  if (activeWorkplace === 'homeoffice') {
    return 'Im Homeoffice darf der Wechsel etwas freier sein.'
  }

  return ''
}

function getSetupReminderHint(reminder) {
  const requiredSetup = reminder?.section?.requiredSetup ?? []
  const movementType = reminder?.section?.movementType
  const position = reminder?.section?.position

  if (requiredSetup.includes('standing-desk')) {
    return 'Kleiner Sitz-Steh-Wechsel, wenn dein Stehpult gerade passt.'
  }

  if (requiredSetup.includes('walking-pad')) {
    return 'Gehimpuls nur, wenn das Walking Pad gerade gut in die Aufgabe passt.'
  }

  if (requiredSetup.includes('hallway')) {
    return 'Ein kurzer Weg reicht, falls du gerade aufstehen möchtest.'
  }

  if (requiredSetup.includes('stairs')) {
    return 'Treppenimpuls nur, wenn du gerade einen aktiveren Moment willst.'
  }

  if (movementType === 'walk' || position === 'walking') {
    return 'Ein kurzer Gehwechsel ist genug.'
  }

  return ''
}
