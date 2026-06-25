import { defaultDaySlotWindows } from './generatePlan.js'
import { getLocalDateKey } from './progressStorage.js'
import {
  getDefaultReminderSettings,
  normalizeDailyReminderState,
  normalizeReminderSettings,
  reminderWindowIds,
} from './reminderStorage.js'

const reminderModeRules = {
  gentle: {
    completionCooldownMinutes: 90,
    dailyReminderLimit: 1,
    fatigueCooldownMinutes: 180,
    fatigueStartsAfter: 1,
    maxSkipsBeforeQuiet: 2,
    maxSnoozesBeforeQuiet: 2,
    reminderCooldownMinutes: 90,
  },
  normal: {
    completionCooldownMinutes: 45,
    dailyReminderLimit: 2,
    fatigueCooldownMinutes: 90,
    fatigueStartsAfter: 3,
    maxSkipsBeforeQuiet: 3,
    maxSnoozesBeforeQuiet: 3,
    reminderCooldownMinutes: 30,
  },
  active: {
    completionCooldownMinutes: 30,
    dailyReminderLimit: 4,
    fatigueCooldownMinutes: 60,
    fatigueStartsAfter: 4,
    maxSkipsBeforeQuiet: 4,
    maxSnoozesBeforeQuiet: 4,
    reminderCooldownMinutes: 20,
  },
}

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

  if (isReminderFatiguedForDay(normalizedState, normalizedSettings.mode, now)) {
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
  const modeRule = getReminderModeRule(normalizedSettings.mode)

  if (snoozedUntil && snoozedUntil > now) {
    return false
  }

  if (
    recentlyOccurred(
      normalizedState.lastReminderShownAt[slotId],
      now,
      modeRule.reminderCooldownMinutes,
    )
  ) {
    return false
  }

  if (
    recentlyOccurred(
      normalizedState.lastCompletedAt,
      now,
      modeRule.completionCooldownMinutes,
    )
  ) {
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

export function isQuietNow(settings, now = new Date()) {
  const quietUntil = parseDate(settings?.quietUntil)

  return Boolean(quietUntil && quietUntil > now)
}

export function isReminderFatiguedForDay(
  state,
  mode = getDefaultReminderSettings().mode,
  now = new Date(),
) {
  const normalizedState = normalizeDailyReminderState(state, now)
  const modeRule = getReminderModeRule(mode)
  const totalSnoozes = sumCounts(normalizedState.snoozeCounts)
  const totalSkips = sumCounts(normalizedState.skipCounts)
  const totalInteractions = totalSnoozes + totalSkips
  const shownCount = normalizedState.reminderShownCount + totalInteractions

  if (normalizedState.pausedForDay) {
    return true
  }

  if (shownCount >= modeRule.dailyReminderLimit) {
    return true
  }

  if (
    totalSnoozes >= modeRule.maxSnoozesBeforeQuiet ||
    totalSkips >= modeRule.maxSkipsBeforeQuiet
  ) {
    return true
  }

  return (
    totalInteractions >= modeRule.fatigueStartsAfter &&
    recentlyOccurred(
      normalizedState.lastInteractionAt,
      now,
      modeRule.fatigueCooldownMinutes,
    )
  )
}

function getSlotWindowMeta(section) {
  if (section?.slotWindowMeta) {
    return section.slotWindowMeta
  }

  return defaultDaySlotWindows.find(
    (slotWindow) => slotWindow.slotId === section?.slotId,
  )?.slotWindowMeta
}

function recentlyOccurred(value, now, cooldownMinutes) {
  const occurredAt = parseDate(value)

  if (!occurredAt) {
    return false
  }

  return now.getTime() - occurredAt.getTime() < cooldownMinutes * 60 * 1000
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

function getReminderModeRule(mode) {
  return reminderModeRules[mode] ?? reminderModeRules.normal
}

function sumCounts(counts) {
  return Object.values(counts ?? {}).reduce((total, count) => total + count, 0)
}
