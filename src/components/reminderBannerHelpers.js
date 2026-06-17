import { getLaterTodaySnoozeUntil } from '../utils/reminderScheduler.js'
import {
  markReminderShown,
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
      title: 'Kurzer Fokus-Reset?',
      text: 'Ein kleiner Wechsel kann helfen, die nächste Fokusphase sauber zu starten.',
    },
    'meeting-heavy': {
      title: 'Zwischen zwei Terminen?',
      text: 'Ein kurzer, diskreter Impuls reicht oft schon.',
    },
    'mixed-day': {
      title: 'Kurzer Wechsel gefällig?',
      text: `${getSlotImpulseLabel(reminder)} ist noch offen.`,
    },
    'study-day': {
      title: 'Kurzer Lern-Reset?',
      text: 'Ein kleiner Wechsel kann helfen, wieder frischer weiterzulernen.',
    },
    'tight-schedule': {
      title: '60 Sekunden reichen.',
      text: 'Ein kurzer Microbreak passt auch in enge Tage.',
    },
  }

  return {
    ...(copies[activeWorkdayType] ?? copies['mixed-day']),
    contextHint: getWorkplaceReminderHint(activeWorkplace),
  }
}

export function getReminderNotificationCopy({
  activeWorkdayType = 'mixed-day',
} = {}) {
  const copies = {
    'focus-heavy': {
      title: 'Kurzer Fokus-Reset?',
      body: 'Ein kleiner Wechsel kann helfen, wieder frischer weiterzuarbeiten.',
    },
    'meeting-heavy': {
      title: 'Zwischen zwei Terminen?',
      body: 'Ein kurzer, diskreter Impuls wartet auf dich.',
    },
    'mixed-day': {
      title: 'Kurzer Wechsel gefällig?',
      body: 'Dein nächster Bewegungsimpuls ist noch offen.',
    },
    'study-day': {
      title: 'Kurzer Lern-Reset?',
      body: 'Ein kleiner Wechsel kann helfen, wieder frischer weiterzulernen.',
    },
    'tight-schedule': {
      title: '60 Sekunden reichen.',
      body: 'Ein kurzer Microbreak ist noch offen.',
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
      state: skipReminderSlot(state, reminder.slotId, now),
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

function getWorkplaceReminderHint(activeWorkplace) {
  if (activeWorkplace === 'office') {
    return 'Direkt am Arbeitsplatz möglich.'
  }

  if (activeWorkplace === 'homeoffice') {
    return 'Nutze den kurzen Raumwechsel.'
  }

  return ''
}
