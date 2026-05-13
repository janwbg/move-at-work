import { getLocalDateKey } from './progressStorage.js'

const recommendationFeedbackStorageKey = 'move-at-work-recommendation-feedback'

export function loadRecommendationFeedback() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedFeedback = window.localStorage.getItem(recommendationFeedbackStorageKey)
    const parsedFeedback = storedFeedback ? JSON.parse(storedFeedback) : []

    return Array.isArray(parsedFeedback)
      ? parsedFeedback.filter(isRecommendationFeedbackEntry)
      : []
  } catch {
    return []
  }
}

export function saveRecommendationFeedback(feedbackEntries) {
  if (typeof window === 'undefined') {
    return
  }

  const safeFeedbackEntries = Array.isArray(feedbackEntries)
    ? feedbackEntries.filter(isRecommendationFeedbackEntry)
    : []

  window.localStorage.setItem(
    recommendationFeedbackStorageKey,
    JSON.stringify(safeFeedbackEntries),
  )
}

export function recordRecommendationFeedback(feedbackEntry, date = new Date()) {
  const normalizedEntry = normalizeRecommendationFeedbackEntry(feedbackEntry, date)

  if (!normalizedEntry) {
    return loadRecommendationFeedback()
  }

  const currentFeedback = loadRecommendationFeedback()
  const existingIndex = currentFeedback.findIndex(
    (entry) => getFeedbackEntryKey(entry) === getFeedbackEntryKey(normalizedEntry),
  )
  const nextFeedback =
    existingIndex >= 0
      ? currentFeedback.map((entry, index) =>
          index === existingIndex ? normalizedEntry : entry,
        )
      : [...currentFeedback, normalizedEntry]

  saveRecommendationFeedback(nextFeedback)
  return nextFeedback
}

export function summarizeRecommendationFeedback(
  feedbackEntries = loadRecommendationFeedback(),
) {
  const safeFeedbackEntries = Array.isArray(feedbackEntries)
    ? feedbackEntries.filter(isRecommendationFeedbackEntry)
    : []
  const reasonCounts = safeFeedbackEntries.reduce((counts, entry) => {
    if (!entry.reason) {
      return counts
    }

    return {
      ...counts,
      [entry.reason]: (counts[entry.reason] ?? 0) + 1,
    }
  }, {})
  const mostCommonReason =
    Object.entries(reasonCounts).sort((first, second) => second[1] - first[1])[0]?.[0] ??
    ''

  return {
    total: safeFeedbackEntries.length,
    fit: safeFeedbackEntries.filter((entry) => entry.feedback === 'fit').length,
    notFit: safeFeedbackEntries.filter((entry) => entry.feedback === 'not-fit').length,
    mostCommonReason,
  }
}

function normalizeRecommendationFeedbackEntry(feedbackEntry, date) {
  if (
    !feedbackEntry?.recommendationId ||
    !['fit', 'not-fit'].includes(feedbackEntry.feedback)
  ) {
    return null
  }

  const currentWorkplace =
    feedbackEntry.currentWorkplace ?? feedbackEntry.workplace ?? ''
  const currentPhase = feedbackEntry.currentPhase ?? feedbackEntry.phase ?? ''
  const normalizedEntry = {
    recommendationId: feedbackEntry.recommendationId,
    date: feedbackEntry.date ?? getLocalDateKey(date),
    workplace: currentWorkplace,
    currentWorkplace,
    workdayType: feedbackEntry.workdayType ?? '',
    intensity: feedbackEntry.intensity ?? '',
    feedback: feedbackEntry.feedback,
  }

  if (currentPhase) {
    normalizedEntry.phase = currentPhase
    normalizedEntry.currentPhase = currentPhase
  }

  if (feedbackEntry.reason) {
    normalizedEntry.reason = feedbackEntry.reason
  }

  if (feedbackEntry.scheduleSectionId) {
    normalizedEntry.scheduleSectionId = feedbackEntry.scheduleSectionId
  }

  if (feedbackEntry.action) {
    normalizedEntry.action = feedbackEntry.action
  }

  return normalizedEntry
}

function isRecommendationFeedbackEntry(entry) {
  return Boolean(
    entry &&
      typeof entry.recommendationId === 'string' &&
      typeof entry.date === 'string' &&
      ['fit', 'not-fit'].includes(entry.feedback),
  )
}

function getFeedbackEntryKey(entry) {
  return `${entry.date}:${entry.recommendationId}`
}
