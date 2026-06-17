import { isValidWorkdayType } from '../data/profileOptions.js'
import { getLocalDateKey } from './progressStorage.js'

const dailyContextStorageKey = 'move-at-work-daily-context'

export function loadDailyContext(date = new Date()) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedContext = window.localStorage.getItem(dailyContextStorageKey)
    const parsedContext = storedContext ? JSON.parse(storedContext) : null
    return normalizeDailyContext(parsedContext, date)
  } catch {
    return null
  }
}

export function saveDailyContext(context, date = new Date()) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedContext = normalizeDailyContext(
    {
      ...context,
      date: getLocalDateKey(date),
    },
    date,
  )

  if (!normalizedContext) {
    return
  }

  window.localStorage.setItem(
    dailyContextStorageKey,
    JSON.stringify(normalizedContext),
  )
}

function normalizeDailyContext(context, date) {
  const dateKey = getLocalDateKey(date)

  if (
    !context ||
    context.date !== dateKey ||
    !isValidWorkdayType(context.currentWorkdayType)
  ) {
    return null
  }

  return {
    date: dateKey,
    currentWorkdayType: context.currentWorkdayType,
  }
}
