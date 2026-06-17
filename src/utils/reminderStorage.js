import { getLocalDateKey } from './progressStorage.js'

export const reminderSettingsStorageKey = 'move-at-work-reminder-settings'
export const reminderStateStorageKey = 'move-at-work-reminder-state'

export const reminderWindowIds = [
  'morning',
  'lunch_transition',
  'afternoon',
  'wrap_up',
]

export const reminderModeWindowDefaults = {
  gentle: ['morning'],
  standard: ['morning', 'afternoon'],
  active: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
}

const defaultReminderSettings = {
  enabled: false,
  mode: 'standard',
  enabledWindows: reminderModeWindowDefaults.standard,
  quietUntil: null,
}

export function getDefaultReminderSettings() {
  return {
    ...defaultReminderSettings,
    enabledWindows: [...defaultReminderSettings.enabledWindows],
  }
}

export function loadReminderSettings() {
  if (typeof window === 'undefined') {
    return getDefaultReminderSettings()
  }

  try {
    const storedSettings = window.localStorage.getItem(reminderSettingsStorageKey)
    return normalizeReminderSettings(
      storedSettings ? JSON.parse(storedSettings) : null,
    )
  } catch {
    return getDefaultReminderSettings()
  }
}

export function saveReminderSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    reminderSettingsStorageKey,
    JSON.stringify(normalizeReminderSettings(settings)),
  )
}

export function normalizeReminderSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return getDefaultReminderSettings()
  }

  const mode = Object.hasOwn(reminderModeWindowDefaults, settings.mode)
    ? settings.mode
    : defaultReminderSettings.mode
  const quietUntil = isValidIsoDateTime(settings.quietUntil)
    ? settings.quietUntil
    : null

  return {
    enabled:
      typeof settings.enabled === 'boolean'
        ? settings.enabled
        : defaultReminderSettings.enabled,
    mode,
    enabledWindows: [...reminderModeWindowDefaults[mode]],
    quietUntil,
  }
}

export function loadDailyReminderState(date = new Date()) {
  if (typeof window === 'undefined') {
    return createDailyReminderState(date)
  }

  try {
    const storedState = window.localStorage.getItem(reminderStateStorageKey)
    return normalizeDailyReminderState(
      storedState ? JSON.parse(storedState) : null,
      date,
    )
  } catch {
    return createDailyReminderState(date)
  }
}

export function saveDailyReminderState(state, date = new Date()) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    reminderStateStorageKey,
    JSON.stringify(normalizeDailyReminderState(state, date)),
  )
}

export function createDailyReminderState(date = new Date()) {
  return {
    date: getLocalDateKey(date),
    snoozedSlots: {},
    skippedSlots: [],
    lastReminderShownAt: {},
  }
}

export function normalizeDailyReminderState(state, date = new Date()) {
  const dateKey = getLocalDateKey(date)

  if (!state || state.date !== dateKey || typeof state !== 'object') {
    return createDailyReminderState(date)
  }

  return {
    date: dateKey,
    snoozedSlots: normalizeSlotDateMap(state.snoozedSlots),
    skippedSlots: normalizeSlotList(state.skippedSlots),
    lastReminderShownAt: normalizeSlotDateMap(state.lastReminderShownAt),
  }
}

export function snoozeReminderState(state, slotId, minutes, now = new Date()) {
  const snoozedUntil = new Date(now)
  snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes)

  return snoozeReminderStateUntil(state, slotId, snoozedUntil.toISOString(), now)
}

export function snoozeReminderStateUntil(
  state,
  slotId,
  isoDateTime,
  date = new Date(),
) {
  const normalizedState = normalizeDailyReminderState(state, date)

  if (!slotId || !isValidIsoDateTime(isoDateTime)) {
    return normalizedState
  }

  return {
    ...normalizedState,
    snoozedSlots: {
      ...normalizedState.snoozedSlots,
      [slotId]: isoDateTime,
    },
    skippedSlots: normalizedState.skippedSlots.filter(
      (skippedSlotId) => skippedSlotId !== slotId,
    ),
  }
}

export function skipReminderSlot(state, slotId, date = new Date()) {
  const normalizedState = normalizeDailyReminderState(state, date)

  if (!slotId || normalizedState.skippedSlots.includes(slotId)) {
    return normalizedState
  }

  return {
    ...normalizedState,
    skippedSlots: [...normalizedState.skippedSlots, slotId],
  }
}

export function markReminderShown(state, slotId, now = new Date()) {
  const normalizedState = normalizeDailyReminderState(state, now)

  if (!slotId) {
    return normalizedState
  }

  return {
    ...normalizedState,
    lastReminderShownAt: {
      ...normalizedState.lastReminderShownAt,
      [slotId]: now.toISOString(),
    },
  }
}

export function getQuietUntilForPreset(preset, now = new Date()) {
  if (preset === 'one-hour') {
    const quietUntil = new Date(now)
    quietUntil.setHours(quietUntil.getHours() + 1)
    return quietUntil.toISOString()
  }

  if (preset === 'today') {
    const quietUntil = new Date(now)
    quietUntil.setHours(23, 59, 59, 999)
    return quietUntil.toISOString()
  }

  if (preset === 'tomorrow') {
    const quietUntil = new Date(now)
    quietUntil.setDate(quietUntil.getDate() + 1)
    quietUntil.setHours(8, 0, 0, 0)
    return quietUntil.toISOString()
  }

  return null
}

function normalizeSlotDateMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([slotId, isoDateTime]) =>
        typeof slotId === 'string' && isValidIsoDateTime(isoDateTime),
    ),
  )
}

function normalizeSlotList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (slotId, index, slots) =>
      typeof slotId === 'string' && slots.indexOf(slotId) === index,
  )
}

function isValidIsoDateTime(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}
