const progressStorageKey = 'move-at-work-progress'

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
    return storedProgress ? JSON.parse(storedProgress) : createEmptyProgress()
  } catch {
    return createEmptyProgress()
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress))
}

export function recordCompletion(progress, exerciseId, date = new Date()) {
  const dateKey = getLocalDateKey(date)
  const completedByDate = progress.completedByDate ?? {}
  const completedToday = new Set(completedByDate[dateKey] ?? [])
  completedToday.add(exerciseId)

  return {
    ...progress,
    completedByDate: {
      ...completedByDate,
      [dateKey]: [...completedToday],
    },
  }
}

export function getCompletedIdsForDate(progress, date = new Date()) {
  return progress.completedByDate?.[getLocalDateKey(date)] ?? []
}

export function calculateProgressSummary(progress, date = new Date()) {
  return {
    completedToday: getCompletedIdsForDate(progress, date).length,
    completedThisWeek: getCompletedThisWeek(progress, date),
    streak: getWorkStreak(progress, date),
  }
}

function createEmptyProgress() {
  return { completedByDate: {} }
}

function getCompletedThisWeek(progress, date) {
  const weekStart = getWeekStart(date)
  const weekEnd = addDays(weekStart, 6)

  return Object.entries(progress.completedByDate ?? {}).reduce(
    (total, [dateKey, exerciseIds]) => {
      const currentDate = parseDateKey(dateKey)

      if (currentDate >= weekStart && currentDate <= weekEnd && isWorkday(currentDate)) {
        return total + exerciseIds.length
      }

      return total
    },
    0,
  )
}

function getWorkStreak(progress, date) {
  let streak = 0
  let cursor = getCurrentOrPreviousWorkday(date)

  while (getCompletedIdsForDate(progress, cursor).length > 0) {
    streak += 1
    cursor = getPreviousWorkday(cursor)
  }

  return streak
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

function getCurrentOrPreviousWorkday(date) {
  let cursor = stripTime(date)

  while (!isWorkday(cursor)) {
    cursor = addDays(cursor, -1)
  }

  return cursor
}

function getPreviousWorkday(date) {
  let cursor = addDays(stripTime(date), -1)

  while (!isWorkday(cursor)) {
    cursor = addDays(cursor, -1)
  }

  return cursor
}

function isWorkday(date) {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}
