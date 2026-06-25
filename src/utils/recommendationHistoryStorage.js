import { getLocalDateKey } from './progressStorage.js'

const recommendationHistoryStorageKey = 'move-at-work-recommendation-history'
const recommendationHistoryWindowDays = 14

export function normalizeRecommendationHistory(history, date = new Date()) {
  const referenceDateKey = getLocalDateKey(date)
  const entries = Array.isArray(history)
    ? history
    : Object.entries(history && typeof history === 'object' ? history : {}).map(
        ([entryDate, ruleIds]) => ({ date: entryDate, ruleIds }),
      )

  return entries
    .map(normalizeRecommendationHistoryEntry)
    .filter(Boolean)
    .filter((entry) => {
      const ageInDays = getDateDistanceInDays(entry.date, referenceDateKey)
      return ageInDays >= 0 && ageInDays < recommendationHistoryWindowDays
    })
    .sort((first, second) => first.date.localeCompare(second.date))
}

export function loadRecommendationHistory(date = new Date()) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedHistory = window.localStorage.getItem(recommendationHistoryStorageKey)
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : []

    return normalizeRecommendationHistory(parsedHistory, date)
  } catch {
    return []
  }
}

export function saveRecommendationHistory(history, date = new Date()) {
  const normalizedHistory = normalizeRecommendationHistory(history, date)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      recommendationHistoryStorageKey,
      JSON.stringify(normalizedHistory),
    )
  }

  return normalizedHistory
}

export function recordRecommendationHistory(ruleIds, date = new Date()) {
  const dateKey = getLocalDateKey(date)
  const currentHistory = loadRecommendationHistory(date)
  const normalizedRuleIds = normalizeRuleIds(ruleIds)
  const nextHistory = [
    ...currentHistory.filter((entry) => entry.date !== dateKey),
    {
      date: dateKey,
      ruleIds: normalizedRuleIds,
    },
  ]

  return saveRecommendationHistory(nextHistory, date)
}

function normalizeRecommendationHistoryEntry(entry) {
  if (!entry || !isLocalDateKey(entry.date)) {
    return null
  }

  const ruleIds = normalizeRuleIds(entry.ruleIds)

  if (!ruleIds.length) {
    return null
  }

  return {
    date: entry.date,
    ruleIds,
  }
}

function normalizeRuleIds(ruleIds) {
  return [
    ...new Set(
      (Array.isArray(ruleIds) ? ruleIds : [])
        .filter((ruleId) => typeof ruleId === 'string')
        .map((ruleId) => ruleId.trim())
        .filter(Boolean),
    ),
  ]
}

function isLocalDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function getDateDistanceInDays(entryDateKey, referenceDateKey) {
  const entryDate = parseLocalDateKey(entryDateKey)
  const referenceDate = parseLocalDateKey(referenceDateKey)

  if (!entryDate || !referenceDate) {
    return Number.POSITIVE_INFINITY
  }

  return Math.round((referenceDate - entryDate) / 86400000)
}

function parseLocalDateKey(dateKey) {
  if (!isLocalDateKey(dateKey)) {
    return null
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}
