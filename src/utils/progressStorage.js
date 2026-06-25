const progressStorageKey = 'move-at-work-progress'
export const routineSettingsStorageKey = 'move-at-work-routine-settings'

export const routineWeekdayOptions = [
  { id: 1, label: 'Mo' },
  { id: 2, label: 'Di' },
  { id: 3, label: 'Mi' },
  { id: 4, label: 'Do' },
  { id: 5, label: 'Fr' },
  { id: 6, label: 'Sa' },
  { id: 0, label: 'So' },
]

export const defaultRoutineSettings = {
  activeWeekdays: [1, 2, 3, 4, 5],
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function loadProgress() {
  if (typeof window === 'undefined') {
    return createEmptyProgress()
  }

  try {
    const storedProgress = window.localStorage.getItem(progressStorageKey)
    return normalizeProgress(storedProgress ? JSON.parse(storedProgress) : null)
  } catch {
    return createEmptyProgress()
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(normalizeProgress(progress)))
}

export function loadRoutineSettings() {
  if (typeof window === 'undefined') {
    return getDefaultRoutineSettings()
  }

  try {
    const storedSettings = window.localStorage.getItem(routineSettingsStorageKey)
    return normalizeRoutineSettings(storedSettings ? JSON.parse(storedSettings) : null)
  } catch {
    return getDefaultRoutineSettings()
  }
}

export function saveRoutineSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    routineSettingsStorageKey,
    JSON.stringify(normalizeRoutineSettings(settings)),
  )
}

export function getDefaultRoutineSettings() {
  return {
    activeWeekdays: [...defaultRoutineSettings.activeWeekdays],
  }
}

export function normalizeRoutineSettings(settings) {
  const activeWeekdays = Array.isArray(settings?.activeWeekdays)
    ? settings.activeWeekdays
    : []
  const validWeekdays = routineWeekdayOptions.map((weekday) => weekday.id)
  const normalizedWeekdays = validWeekdays.filter((weekday) =>
    activeWeekdays.includes(weekday),
  )

  return {
    activeWeekdays: normalizedWeekdays.length
      ? normalizedWeekdays
      : [...defaultRoutineSettings.activeWeekdays],
  }
}

export function recordCompletion(progress, exerciseId, date = new Date()) {
  const dateKey = getLocalDateKey(date)
  const normalizedProgress = normalizeProgress(progress)
  const completedByDate = normalizedProgress.completedByDate
  const completedToday = new Set(completedByDate[dateKey] ?? [])
  completedToday.add(exerciseId)

  return {
    ...normalizedProgress,
    completedByDate: {
      ...completedByDate,
      [dateKey]: [...completedToday],
    },
  }
}

export function getCompletedIdsForDate(progress, date = new Date()) {
  return normalizeProgress(progress).completedByDate[getLocalDateKey(date)] ?? []
}

export function setPauseDay(progress, date = new Date(), paused = true) {
  const normalizedProgress = normalizeProgress(progress)
  const dateKey = getLocalDateKey(date)
  const pauseDates = new Set(normalizedProgress.pauseDates)
  const activeDates = new Set(normalizedProgress.activeDates)

  if (paused) {
    pauseDates.add(dateKey)
    activeDates.delete(dateKey)
  } else {
    pauseDates.delete(dateKey)
  }

  return {
    ...normalizedProgress,
    activeDates: [...activeDates].sort(),
    pauseDates: [...pauseDates].sort(),
  }
}

export function isPauseDay(progress, date = new Date()) {
  return normalizeProgress(progress).pauseDates.includes(getLocalDateKey(date))
}

export function setActiveDay(progress, date = new Date(), active = true) {
  const normalizedProgress = normalizeProgress(progress)
  const dateKey = getLocalDateKey(date)
  const activeDates = new Set(normalizedProgress.activeDates)
  const pauseDates = new Set(normalizedProgress.pauseDates)

  if (active) {
    activeDates.add(dateKey)
    pauseDates.delete(dateKey)
  } else {
    activeDates.delete(dateKey)
  }

  return {
    ...normalizedProgress,
    activeDates: [...activeDates].sort(),
    pauseDates: [...pauseDates].sort(),
  }
}

export function isManuallyActiveDay(progress, date = new Date()) {
  return normalizeProgress(progress).activeDates.includes(getLocalDateKey(date))
}

export function hasCompleteDayCelebration(progress, date = new Date()) {
  return normalizeProgress(progress).completeDayCelebrationDates.includes(
    getLocalDateKey(date),
  )
}

export function markCompleteDayCelebration(progress, date = new Date()) {
  const normalizedProgress = normalizeProgress(progress)
  const dateKey = getLocalDateKey(date)

  return {
    ...normalizedProgress,
    completeDayCelebrationDates: [
      ...new Set([...normalizedProgress.completeDayCelebrationDates, dateKey]),
    ].sort(),
  }
}

export function calculateProgressSummary(
  progress,
  date = new Date(),
  routineSettings = getDefaultRoutineSettings(),
) {
  const normalizedProgress = normalizeProgress(progress)
  const normalizedRoutineSettings = normalizeRoutineSettings(routineSettings)
  const routineWeek = getRoutineWeekSummary(
    normalizedProgress,
    date,
    normalizedRoutineSettings,
  )

  return {
    completedToday: getCompletedIdsForDate(normalizedProgress, date).length,
    completedThisWeek: getCompletedThisWeek(
      normalizedProgress,
      date,
      normalizedRoutineSettings,
    ),
    routineWeek,
    routineCalendar: getRoutineCalendarDays({
      date,
      progress: normalizedProgress,
      routineSettings: normalizedRoutineSettings,
    }),
    streak: getRoutineStreak(normalizedProgress, date, normalizedRoutineSettings),
    todayStatus: getRoutineDayStatus({
      date,
      progress: normalizedProgress,
      referenceDate: date,
      routineSettings: normalizedRoutineSettings,
      treatInactiveAsPause: true,
    }),
  }
}

function createEmptyProgress() {
  return {
    activeDates: [],
    completedByDate: {},
    completeDayCelebrationDates: [],
    pauseDates: [],
  }
}

export function getRoutineCalendarDays({
  date = new Date(),
  days = 28,
  progress = createEmptyProgress(),
  routineSettings = getDefaultRoutineSettings(),
} = {}) {
  const normalizedProgress = normalizeProgress(progress)
  const normalizedRoutineSettings = normalizeRoutineSettings(routineSettings)
  const endDate = stripTime(date)
  const dayCount = Math.max(days, 1)
  const startDate = addDays(endDate, -(dayCount - 1))

  return Array.from({ length: dayCount }, (_, index) => {
    const currentDate = addDays(startDate, index)
    const status = getRoutineDayStatus({
      date: currentDate,
      progress: normalizedProgress,
      referenceDate: endDate,
      routineSettings: normalizedRoutineSettings,
    })

    return {
      date: getLocalDateKey(currentDate),
      dayLabel: String(currentDate.getDate()),
      isToday: getLocalDateKey(currentDate) === getLocalDateKey(endDate),
      status,
      weekday: currentDate.getDay(),
    }
  })
}

export function getRoutineDayStatus({
  date = new Date(),
  progress = createEmptyProgress(),
  referenceDate = new Date(),
  routineSettings = getDefaultRoutineSettings(),
  treatInactiveAsPause = false,
} = {}) {
  const normalizedProgress = normalizeProgress(progress)
  const completedCount = getCompletedIdsForDate(normalizedProgress, date).length
  const paused = isPauseDay(normalizedProgress, date)
  const active =
    isRoutineActiveDay(date, routineSettings) ||
    isManuallyActiveDay(normalizedProgress, date)

  if (completedCount >= 5) {
    return { id: 'complete', completedCount, label: 'Kompletter Tag' }
  }

  if (completedCount >= 3) {
    return { id: 'strong', completedCount, label: 'Starker Tag' }
  }

  if (completedCount >= 1) {
    return { id: 'held', completedCount, label: 'Routine gehalten' }
  }

  if (paused) {
    return {
      id: 'pause',
      completedCount,
      label: 'Pausentag',
      neutral: true,
    }
  }

  if (!active) {
    if (treatInactiveAsPause) {
      return {
        id: 'pause',
        completedCount,
        label: 'Pausentag',
        neutral: true,
      }
    }

    return {
      id: 'neutral',
      completedCount,
      label: 'Neutraler Tag',
      neutral: true,
    }
  }

  return {
    id: stripTime(date) < stripTime(referenceDate) ? 'missed' : 'open',
    completedCount,
    label: stripTime(date) < stripTime(referenceDate) ? 'Nicht geschafft' : 'Offen',
  }
}

export function isRoutineActiveDay(
  date = new Date(),
  routineSettings = getDefaultRoutineSettings(),
) {
  return normalizeRoutineSettings(routineSettings).activeWeekdays.includes(
    stripTime(date).getDay(),
  )
}

function getCompletedThisWeek(progress, date, routineSettings) {
  const weekStart = getWeekStart(date)
  const weekEnd = addDays(weekStart, 6)

  return Object.entries(progress.completedByDate ?? {}).reduce(
    (total, [dateKey, exerciseIds]) => {
      const currentDate = parseDateKey(dateKey)

      if (
        currentDate >= weekStart &&
        currentDate <= weekEnd &&
        isCountableRoutineDay(progress, currentDate, routineSettings)
      ) {
        return total + exerciseIds.length
      }

      return total
    },
    0,
  )
}

function getRoutineStreak(progress, date, routineSettings) {
  let streak = 0
  let cursor = getCurrentOrPreviousRoutineDay(progress, date, routineSettings)

  while (getCompletedIdsForDate(progress, cursor).length > 0) {
    streak += 1
    cursor = getPreviousRoutineDay(progress, cursor, routineSettings)
  }

  return streak
}

function getRoutineWeekSummary(progress, date, routineSettings) {
  const weekStart = getWeekStart(date)
  const today = stripTime(date)
  let plannedDays = 0
  let completedDays = 0

  for (let cursor = weekStart; cursor <= today; cursor = addDays(cursor, 1)) {
    if (!isCountableRoutineDay(progress, cursor, routineSettings)) {
      continue
    }

    plannedDays += 1

    if (getCompletedIdsForDate(progress, cursor).length > 0) {
      completedDays += 1
    }
  }

  return {
    completedDays,
    plannedDays,
  }
}

function getWeekStart(date) {
  const currentDate = stripTime(date)
  const day = currentDate.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  return addDays(currentDate, diffToMonday)
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getCurrentOrPreviousRoutineDay(progress, date, routineSettings) {
  let cursor = stripTime(date)

  while (!isCountableRoutineDay(progress, cursor, routineSettings)) {
    cursor = addDays(cursor, -1)
  }

  if (getCompletedIdsForDate(progress, cursor).length === 0) {
    return getPreviousRoutineDay(progress, cursor, routineSettings)
  }

  return cursor
}

function getPreviousRoutineDay(progress, date, routineSettings) {
  let cursor = addDays(stripTime(date), -1)

  while (!isCountableRoutineDay(progress, cursor, routineSettings)) {
    cursor = addDays(cursor, -1)
  }

  return cursor
}

function isCountableRoutineDay(progress, date, routineSettings) {
  if (getCompletedIdsForDate(progress, date).length > 0) {
    return true
  }

  return (
    (isRoutineActiveDay(date, routineSettings) || isManuallyActiveDay(progress, date)) &&
    !isPauseDay(progress, date)
  )
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function normalizeProgress(progress) {
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
    return createEmptyProgress()
  }

  return {
    activeDates: normalizeDateList(progress.activeDates),
    completedByDate: normalizeCompletedByDate(progress.completedByDate),
    completeDayCelebrationDates: normalizeDateList(
      progress.completeDayCelebrationDates,
    ),
    pauseDates: normalizeDateList(progress.pauseDates),
  }
}

function normalizeCompletedByDate(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([dateKey, exerciseIds]) =>
        isValidDateKey(dateKey) && Array.isArray(exerciseIds),
      )
      .map(([dateKey, exerciseIds]) => [
        dateKey,
        [...new Set(exerciseIds.filter((exerciseId) => typeof exerciseId === 'string'))],
      ]),
  )
}

function normalizeDateList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter(isValidDateKey))].sort()
}

function isValidDateKey(dateKey) {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false
  }

  return getLocalDateKey(parseDateKey(dateKey)) === dateKey
}
