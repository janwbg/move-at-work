import { getLocalDateKey } from './progressStorage.js'

const recommendationFeedbackStorageKey = 'move-at-work-recommendation-feedback'

export const recommendationBenefitOptions = [
  { id: 'more-awake', label: 'Wacher' },
  { id: 'more-relaxed', label: 'Entspannter' },
  { id: 'more-focused', label: 'Fokussierter' },
  { id: 'looser', label: 'Lockerer' },
  { id: 'no-difference', label: 'Kein Unterschied' },
]

const positiveBenefitIds = new Set([
  'more-awake',
  'more-relaxed',
  'more-focused',
  'looser',
])

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
          index === existingIndex ? { ...entry, ...normalizedEntry } : entry,
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
  const benefitEntries = safeFeedbackEntries.filter((entry) => entry.effect)
  const positiveBenefitCount = benefitEntries.filter((entry) =>
    positiveBenefitIds.has(entry.effect),
  ).length

  return {
    total: safeFeedbackEntries.length,
    fit: safeFeedbackEntries.filter((entry) => entry.feedback === 'fit').length,
    notFit: safeFeedbackEntries.filter((entry) => entry.feedback === 'not-fit').length,
    mostCommonReason,
    benefitTotal: benefitEntries.length,
    positiveBenefitCount,
  }
}

function normalizeRecommendationFeedbackEntry(feedbackEntry, date) {
  if (!feedbackEntry?.recommendationId) {
    return null
  }

  const feedback = normalizeFitFeedback(feedbackEntry.feedback)
  const effect = normalizeBenefitFeedback(feedbackEntry.effect)

  if (!feedback && !effect) {
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
  }

  if (feedback) {
    normalizedEntry.feedback = feedback
  }

  if (effect) {
    normalizedEntry.effect = effect
  }

  if (currentPhase) {
    normalizedEntry.phase = currentPhase
    normalizedEntry.currentPhase = currentPhase
  }

  if (feedbackEntry.reason) {
    normalizedEntry.reason = feedbackEntry.reason
  }

  if (
    feedbackEntry.replacementReason ||
    (feedbackEntry.action === 'replaced' && feedbackEntry.reason)
  ) {
    normalizedEntry.replacementReason =
      feedbackEntry.replacementReason ?? feedbackEntry.reason
  }

  if (feedbackEntry.replacementRecommendationId) {
    normalizedEntry.replacementRecommendationId =
      feedbackEntry.replacementRecommendationId
  }

  if (feedbackEntry.slotId) {
    normalizedEntry.slotId = feedbackEntry.slotId
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
      (normalizeFitFeedback(entry.feedback) || normalizeBenefitFeedback(entry.effect)),
  )
}

function getFeedbackEntryKey(entry) {
  return `${entry.date}:${entry.recommendationId}:${entry.slotId ?? entry.scheduleSectionId ?? ''}`
}

function normalizeFitFeedback(feedback) {
  return ['fit', 'not-fit'].includes(feedback) ? feedback : ''
}

function normalizeBenefitFeedback(effect) {
  return recommendationBenefitOptions.some((option) => option.id === effect)
    ? effect
    : ''
}
