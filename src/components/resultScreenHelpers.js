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
