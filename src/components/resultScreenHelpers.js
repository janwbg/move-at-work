import {
  getLocalDateKey,
  hasCompleteDayCelebration,
} from '../utils/progressStorage.js'
import { recordRecommendationHistory } from '../utils/recommendationHistoryStorage.js'

export const completedSectionSnapshotsStorageKey =
  'move-at-work-completed-section-snapshots'

export function createRecommendationFeedbackContext({
  activeWorkPhase,
  activeWorkdayType,
  activeWorkplace,
  fallbackIntensity,
  section,
}) {
  return {
    recommendationId: section.ruleId ?? section.id,
    scheduleSectionId: section.id,
    workplace: activeWorkplace,
    currentWorkplace: activeWorkplace,
    phase: activeWorkPhase,
    currentPhase: activeWorkPhase,
    workdayType: activeWorkdayType,
    intensity: section.intensity ?? fallbackIntensity,
  }
}

export function shouldShowCompleteDaySuccess({
  completedBefore = 0,
  date = new Date(),
  progress,
  totalToday = 0,
} = {}) {
  return Boolean(
    totalToday >= 5 &&
      completedBefore < totalToday &&
      completedBefore + 1 >= totalToday &&
      !hasCompleteDayCelebration(progress, date),
  )
}

export function preserveCompletedSections(currentPlan, nextPlan, completedIds) {
  const completedIdSet = new Set(completedIds)
  const currentSchedule = currentPlan?.dailySchedule ?? []
  const nextSchedule = nextPlan?.dailySchedule ?? []

  return {
    ...nextPlan,
    dailySchedule: nextSchedule.map((section, index) => {
      const currentSection = currentSchedule[index]

      return currentSection && completedIdSet.has(currentSection.id)
        ? currentSection
        : section
    }),
  }
}

export function preserveCompletedSectionsFromSnapshots(
  nextPlan,
  completedIds,
  snapshots,
) {
  const completedIdSet = new Set(completedIds)
  const nextSchedule = nextPlan?.dailySchedule ?? []
  const validSnapshots = normalizeCompletedSectionSnapshots(snapshots).filter(
    (snapshot) => completedIdSet.has(snapshot.section.id),
  )
  const snapshotsByIndex = new Map(
    validSnapshots.map((snapshot) => [snapshot.index, snapshot.section]),
  )
  const snapshotsBySlotId = new Map(
    validSnapshots
      .filter((snapshot) => snapshot.slotId)
      .map((snapshot) => [snapshot.slotId, snapshot.section]),
  )

  if (!validSnapshots.length) {
    return nextPlan
  }

  return {
    ...nextPlan,
    dailySchedule: nextSchedule.map((section, index) => {
      const preservedSection =
        snapshotsByIndex.get(index) ?? snapshotsBySlotId.get(section.slotId)

      return preservedSection ?? section
    }),
  }
}

export function recordVisiblePlanHistory(plan, date = new Date()) {
  const ruleIds = (Array.isArray(plan?.dailySchedule) ? plan.dailySchedule : [])
    .map((section) => section.ruleId ?? section.id)
    .filter((ruleId) => typeof ruleId === 'string' && ruleId)

  if (!ruleIds.length) {
    return []
  }

  return recordRecommendationHistory(ruleIds, date)
}

export function loadCompletedSectionSnapshots(date = new Date()) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedSnapshots = window.localStorage.getItem(
      completedSectionSnapshotsStorageKey,
    )
    const parsedSnapshots = storedSnapshots ? JSON.parse(storedSnapshots) : {}

    return normalizeCompletedSectionSnapshots(
      parsedSnapshots?.[getLocalDateKey(date)],
    )
  } catch {
    return []
  }
}

export function saveCompletedSectionSnapshots(
  snapshots,
  date = new Date(),
) {
  if (typeof window === 'undefined') {
    return
  }

  const dateKey = getLocalDateKey(date)
  const normalizedSnapshots = normalizeCompletedSectionSnapshots(snapshots)
  let storedSnapshots

  try {
    storedSnapshots = JSON.parse(
      window.localStorage.getItem(completedSectionSnapshotsStorageKey) ?? '{}',
    )
  } catch {
    storedSnapshots = {}
  }

  window.localStorage.setItem(
    completedSectionSnapshotsStorageKey,
    JSON.stringify({
      ...(storedSnapshots && typeof storedSnapshots === 'object'
        ? storedSnapshots
        : {}),
      [dateKey]: normalizedSnapshots,
    }),
  )
}

export function recordCompletedSectionSnapshot(snapshots, { index, section }) {
  if (!section?.id || !Number.isInteger(index) || index < 0) {
    return normalizeCompletedSectionSnapshots(snapshots)
  }

  const nextSnapshot = {
    id: section.id,
    index,
    section,
    slotId: section.slotId ?? '',
  }

  return [
    ...normalizeCompletedSectionSnapshots(snapshots).filter(
      (snapshot) =>
        snapshot.section.id !== section.id && snapshot.index !== index,
    ),
    nextSnapshot,
  ].sort((first, second) => first.index - second.index)
}

function normalizeCompletedSectionSnapshots(snapshots) {
  if (!Array.isArray(snapshots)) {
    return []
  }

  return snapshots
    .filter(
      (snapshot) =>
        Number.isInteger(snapshot?.index) &&
        snapshot.index >= 0 &&
        snapshot?.section &&
        typeof snapshot.section.id === 'string',
    )
    .map((snapshot) => ({
      id: snapshot.section.id,
      index: snapshot.index,
      section: snapshot.section,
      slotId:
        typeof snapshot.slotId === 'string'
          ? snapshot.slotId
          : snapshot.section.slotId ?? '',
    }))
}
