import { defaultDaySlotWindows } from './generatePlan.js'
import { getLocalDateKey } from './progressStorage.js'
import {
  getDefaultReminderSettings,
  normalizeDailyReminderState,
  normalizeReminderSettings,
  reminderWindowIds,
} from './reminderStorage.js'

const reminderCooldownMinutes = 30
const reminderWindowOrder = ['morning', 'lunch_transition', 'afternoon', 'wrap_up']

export function getDueReminder({
  completedIds = [],
  now = new Date(),
  plan,
  state,
  settings,
} = {}) {
  const normalizedSettings = normalizeReminderSettings(
    settings ?? getDefaultReminderSettings(),
  )
  const normalizedState = normalizeDailyReminderState(state, now)

  if (!normalizedSettings.enabled || isQuietNow(normalizedSettings, now)) {
    return null
  }

  const completedIdSet = new Set(completedIds)
  const sections = Array.isArray(plan?.dailySchedule) ? plan.dailySchedule : []

  for (const [index, section] of sections.entries()) {
    const slotId = section.slotId

    if (!isReminderCandidate({
      completedIdSet,
      normalizedSettings,
      normalizedState,
      now,
      section,
      slotId,
    })) {
      continue
    }

    return {
      index,
      section,
      slotId,
      slotLabel: section.slotLabel ?? section.timeLabel ?? 'Impuls',
    }
  }

  return null
}

export function isReminderCandidate({
  completedIdSet = new Set(),
  normalizedSettings,
  normalizedState,
  now = new Date(),
  section,
  slotId,
}) {
  if (
    !slotId ||
    !reminderWindowIds.includes(slotId) ||
    !normalizedSettings.enabledWindows.includes(slotId) ||
    completedIdSet.has(section?.id) ||
    normalizedState.skippedSlots.includes(slotId)
  ) {
    return false
  }

  const snoozedUntil = parseDate(normalizedState.snoozedSlots[slotId])

  if (snoozedUntil && snoozedUntil > now) {
    return false
  }

  if (recentlyShown(normalizedState.lastReminderShownAt[slotId], now)) {
    return false
  }

  if (snoozedUntil && snoozedUntil <= now) {
    return isSameLocalDate(snoozedUntil, now) && !isAfterDayEnd(now)
  }

  return isWithinSlotWindow(section, now)
}

export function isWithinSlotWindow(section, now = new Date()) {
  const windowMeta = getSlotWindowMeta(section)

  if (!windowMeta?.startTime || !windowMeta?.endTime) {
    return false
  }

  const windowStart = buildLocalTime(now, windowMeta.startTime)
  const windowEnd = buildLocalTime(now, windowMeta.endTime)

  return now >= windowStart && now <= windowEnd
}

export function getLaterTodaySnoozeUntil({
  currentSlotId,
  now = new Date(),
  settings,
} = {}) {
  const normalizedSettings = normalizeReminderSettings(
    settings ?? getDefaultReminderSettings(),
  )
  const currentIndex = reminderWindowOrder.indexOf(currentSlotId)

  if (currentIndex === -1) {
    return null
  }

  const laterSlotId = reminderWindowOrder
    .slice(currentIndex + 1)
    .find((slotId) => normalizedSettings.enabledWindows.includes(slotId))
  const laterWindow = defaultDaySlotWindows.find(
    (slotWindow) => slotWindow.slotId === laterSlotId,
  )

  if (!laterWindow?.slotWindowMeta?.startTime) {
    return null
  }

  const laterStart = buildLocalTime(now, laterWindow.slotWindowMeta.startTime)

  return laterStart > now ? laterStart.toISOString() : null
}

export function isQuietNow(settings, now = new Date()) {
  const quietUntil = parseDate(settings?.quietUntil)

  return Boolean(quietUntil && quietUntil > now)
}

function getSlotWindowMeta(section) {
  if (section?.slotWindowMeta) {
    return section.slotWindowMeta
  }

  return defaultDaySlotWindows.find(
    (slotWindow) => slotWindow.slotId === section?.slotId,
  )?.slotWindowMeta
}

function recentlyShown(lastShownAt, now) {
  const shownAt = parseDate(lastShownAt)

  if (!shownAt) {
    return false
  }

  return now.getTime() - shownAt.getTime() < reminderCooldownMinutes * 60 * 1000
}

function buildLocalTime(date, timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const localTime = new Date(date)
  localTime.setHours(hours, minutes, 0, 0)
  return localTime
}

function parseDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameLocalDate(firstDate, secondDate) {
  return getLocalDateKey(firstDate) === getLocalDateKey(secondDate)
}

function isAfterDayEnd(now) {
  const dayEnd = new Date(now)
  dayEnd.setHours(23, 59, 59, 999)

  return now > dayEnd
}
