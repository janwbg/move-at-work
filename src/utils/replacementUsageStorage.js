import { getLocalDateKey } from './progressStorage.js'
import { isPlusUser } from './premiumStatus.js'

const replacementUsageStorageKey = 'move-at-work-replacement-usage'
const freeDailyReplacementLimit = 1

export function createReplacementUsage(date = new Date()) {
  return {
    date: getLocalDateKey(date),
    replacementsUsed: 0,
  }
}

export function normalizeReplacementUsage(usage, date = new Date()) {
  const dateKey = getLocalDateKey(date)

  if (!usage || usage.date !== dateKey) {
    return createReplacementUsage(date)
  }

  const parsedReplacementsUsed = Number(usage.replacementsUsed)
  const replacementsUsed = Number.isFinite(parsedReplacementsUsed)
    ? Math.max(0, Math.floor(parsedReplacementsUsed))
    : 0

  return {
    date: dateKey,
    replacementsUsed,
  }
}

export function loadReplacementUsage(date = new Date()) {
  if (typeof window === 'undefined') {
    return createReplacementUsage(date)
  }

  try {
    const storedUsage = window.localStorage.getItem(replacementUsageStorageKey)
    const parsedUsage = storedUsage ? JSON.parse(storedUsage) : null

    return normalizeReplacementUsage(parsedUsage, date)
  } catch {
    return createReplacementUsage(date)
  }
}

export function saveReplacementUsage(usage, date = new Date()) {
  const normalizedUsage = normalizeReplacementUsage(usage, date)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      replacementUsageStorageKey,
      JSON.stringify(normalizedUsage),
    )
  }

  return normalizedUsage
}

export function canUseReplacement({
  premiumStatus,
  usage,
  date = new Date(),
} = {}) {
  if (isPlusUser(premiumStatus)) {
    return true
  }

  return (
    normalizeReplacementUsage(usage ?? loadReplacementUsage(date), date)
      .replacementsUsed < freeDailyReplacementLimit
  )
}

export function recordReplacementUsage(date = new Date()) {
  const currentUsage = loadReplacementUsage(date)
  const nextUsage = {
    ...currentUsage,
    replacementsUsed: currentUsage.replacementsUsed + 1,
  }

  return saveReplacementUsage(nextUsage, date)
}
