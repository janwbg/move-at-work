import {
  markReminderShown,
  pauseRemindersForDay,
  skipReminderSlot,
  snoozeReminderState,
} from '../utils/reminderStorage.js'

export function getReminderCopy({
  activeWorkdayType = 'mixed-day',
  activeWorkplace,
  reminder,
}) {
  const copies = {
    'focus-heavy': {
      title: 'Zeit für einen kurzen Reset?',
      text: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
    },
    'meeting-heavy': {
      title: 'Kurze Bewegungspause?',
      text: 'Diese Empfehlung hilft dir, deine Sitzphase zu unterbrechen.',
    },
    'mixed-day': {
      title: 'Zeit für einen kurzen Reset?',
      text: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
    },
    'study-day': {
      title: 'Kurze Bewegungspause?',
      text: 'Diese Empfehlung hilft dir, deine Sitzphase zu unterbrechen.',
    },
    'tight-schedule': {
      title: 'Zeit für einen kurzen Reset?',
      text: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
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
      title: 'Zeit für einen kurzen Reset?',
      body: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
    },
    'meeting-heavy': {
      title: 'Kurze Bewegungspause?',
      body: 'Diese Empfehlung hilft dir, deine Sitzphase zu unterbrechen.',
    },
    'mixed-day': {
      title: 'Zeit für einen kurzen Reset?',
      body: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
    },
    'study-day': {
      title: 'Kurze Bewegungspause?',
      body: 'Diese Empfehlung hilft dir, deine Sitzphase zu unterbrechen.',
    },
    'tight-schedule': {
      title: 'Zeit für einen kurzen Reset?',
      body: 'Ein kleiner Bewegungsimpuls passt jetzt gut.',
    },
  }

  return copies[activeWorkdayType] ?? copies['mixed-day']
}

export function applyReminderBannerAction({
  action,
  now = new Date(),
  reminder,
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
    return {
      state: skipReminderSlot(state, reminder.slotId, now),
    }
  }

  if (action === 'skip-today') {
    return {
      state: pauseRemindersForDay(state, now),
    }
  }

  return null
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
