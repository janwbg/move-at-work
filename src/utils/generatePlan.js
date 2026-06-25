import { movementRecommendations } from '../data/movementRecommendations.js'
import {
  deriveWorkPhaseFromWorkday,
  getOptionLabel,
  goalOptions,
  intensityOptions,
  isValidWorkdayType,
  normalizeProfileAnswers,
  setupOptions,
  workplaceOptions,
  workdayOptions,
  workPhaseOptions,
} from '../data/profileOptions.js'
import { loadRecommendationFeedback } from './recommendationFeedbackStorage.js'
import { loadRecommendationHistory } from './recommendationHistoryStorage.js'

const minimumRecommendations = 3
const maximumRecommendations = 5
const miniResetMovementType = 'mini_reset'
const recommendationFeedbackWindowDays = 60
const concreteSmallEquipmentIds = [
  'resistance_band',
  'balance_cushion',
  'exercise_ball',
]

const setupDisplayLabels = {
  'small-equipment': 'Kleines Bewegungsequipment',
  'ergonomic-support': 'Ergonomische Sitz- oder Stehhilfe',
}

export const defaultDaySlotWindows = [
  {
    slotId: 'start',
    slotLabel: 'Start in den Arbeitstag',
    slotRole: 'start',
    slotWindowMeta: {
      startTime: '08:00',
      endTime: '08:45',
      relativeDescription: 'zu Beginn des Arbeitstags',
    },
  },
  {
    slotId: 'morning',
    slotLabel: 'Vormittag',
    slotRole: 'focus',
    slotWindowMeta: {
      startTime: '09:30',
      endTime: '10:30',
      relativeDescription: 'nach der ersten längeren Arbeitsphase',
    },
  },
  {
    slotId: 'lunch_transition',
    slotLabel: 'Mittagswechsel',
    slotRole: 'movement',
    slotWindowMeta: {
      startTime: '12:00',
      endTime: '13:30',
      relativeDescription: 'rund um die Mittagspause',
    },
  },
  {
    slotId: 'afternoon',
    slotLabel: 'Nachmittag',
    slotRole: 'relief',
    slotWindowMeta: {
      startTime: '14:00',
      endTime: '15:15',
      relativeDescription: 'im Nachmittagstief',
    },
  },
  {
    slotId: 'wrap_up',
    slotLabel: 'Tagesabschluss',
    slotRole: 'closing',
    slotWindowMeta: {
      startTime: '16:15',
      endTime: '17:00',
      relativeDescription: 'zum Abschluss des Arbeitstags',
    },
  },
]

// Legacy extended-slot definitions are kept out of the active five-slot plan path.
export const legacyExtendedDaySlots = [
  ...defaultDaySlotWindows,
  {
    slotId: 'late_morning',
    slotLabel: 'Später Vormittag',
    slotRole: 'movement',
    slotWindowMeta: {
      startTime: '10:45',
      endTime: '11:30',
      relativeDescription: 'vor der Mittagspause',
    },
  },
  {
    slotId: 'early_afternoon',
    slotLabel: 'Früher Nachmittag',
    slotRole: 'movement',
    slotWindowMeta: {
      startTime: '13:30',
      endTime: '14:15',
      relativeDescription: 'nach der Mittagspause',
    },
  },
]

const allowedIntensities = {
  active: ['gentle', 'balanced', 'active'],
  balanced: ['gentle', 'balanced'],
  gentle: ['gentle'],
}

const intensityLabels = {
  active: 'Hoch',
  balanced: 'Mittel',
  gentle: 'Leicht',
}

const movementTypeLegacyTypes = {
  activate: 'strength',
  breathing: 'mobility',
  eyes: 'mobility',
  mini_reset: 'mobility',
  mobilize: 'mobility',
  relax: 'mobility',
  sit_reset: 'posture',
  stand: 'standing',
  stretch: 'mobility',
  walk: 'walking',
  walking_meeting: 'walking',
}

const phaseMovementTypeScores = {
  break: { activate: 26, mobilize: 12, stretch: 14, walk: 18 },
  'between-tasks': { activate: 12, mobilize: 18, sit_reset: 16, walk: 22 },
  focus: { breathing: 24, eyes: 28, mini_reset: 34, mobilize: 22, sit_reset: 20, walk: 8 },
  meeting: { mini_reset: 22, sit_reset: 24, stand: 20, walking_meeting: 24 },
  phone: { stand: 16, walk: 30, walking_meeting: 28 },
}

const goalMovementTypeScores = {
  'back-neck': { mobilize: 28, sit_reset: 22, stretch: 22 },
  focus: { breathing: 18, eyes: 24, mini_reset: 22, mobilize: 14, sit_reset: 18 },
  'more-energy': { activate: 24, stand: 12, walk: 26, walking_meeting: 18 },
  'sit-less': { sit_reset: 18, stand: 26, walk: 24, walking_meeting: 16 },
}

const slotMovementTypeScores = {
  start: { breathing: 24, mini_reset: 18, mobilize: 22, sit_reset: 22, stand: 8 },
  focus: { breathing: 24, mini_reset: 30, mobilize: 22, sit_reset: 20 },
  movement: { activate: 24, stand: 20, walk: 30, walking_meeting: 24 },
  relief: { mobilize: 24, sit_reset: 14, stretch: 28 },
  closing: { breathing: 26, mini_reset: 24, mobilize: 12, sit_reset: 22, stand: 8 },
}

const slotBodyAreaScores = {
  focus: { breathing: 18, eyes: 24, neck: 8, shoulders: 8, wrists: 8 },
  relief: {
    hips: 16,
    'lower-back': 18,
    neck: 18,
    shoulders: 18,
    spine: 18,
    'upper-back': 18,
  },
}

const slotPositionScores = {
  start: { sitting: 8, standing: 8, mixed: 6 },
  focus: { sitting: 14, desk: 12 },
  movement: { walking: 28, standing: 18, stairs: 18, mixed: 12 },
  relief: { sitting: 8, standing: 8, floor: 10, mixed: 8 },
  closing: { sitting: 12, standing: 6, mixed: 8 },
}

const slotVisibilityScores = {
  start: { discreet: 14, normal: 10 },
  focus: { discreet: 18, normal: 10 },
  movement: { discreet: 2, normal: 10, visible: 8 },
  relief: { discreet: 6, normal: 12, visible: 6 },
  closing: { discreet: 18, normal: 8 },
}

const workdayMovementTypeScores = {
  'study-day': {
    breathing: 18,
    eyes: 24,
    mini_reset: 18,
    mobilize: 20,
    sit_reset: 20,
    stretch: 10,
    walk: 14,
  },
  'tight-schedule': {
    breathing: 24,
    eyes: 22,
    mini_reset: 54,
    mobilize: 18,
    sit_reset: 24,
    stand: 12,
    stretch: 8,
  },
}

const workdayBodyAreaScores = {
  'study-day': {
    eyes: 24,
    neck: 18,
    shoulders: 18,
    spine: 10,
    'upper-back': 14,
    'lower-back': 10,
  },
  'tight-schedule': {
    breathing: 16,
    eyes: 16,
    neck: 12,
    shoulders: 12,
  },
}

const relaxedIntensities = {
  active: ['gentle', 'balanced', 'active'],
  balanced: ['gentle', 'balanced', 'active'],
  gentle: ['gentle', 'balanced'],
}

export function generatePlan(answers) {
  const context = normalizeContext(answers)
  const recommendationCount = getRecommendationCount(context)
  const candidates = getMatchingRecommendations(context)
  const sortedCandidates = sortRecommendations(candidates, context)
  const recommendations = ensureMinimumRecommendations(
    avoidBadSequences(sortedCandidates, recommendationCount),
    sortedCandidates,
    context,
    recommendationCount,
  )
  const dailySchedule = buildDailySchedule(sortedCandidates, context)

  return {
    dailySchedule,
    summary: buildSummary(context),
    rhythm: buildRhythm(context),
    movements: recommendations.map((recommendation) =>
      toMovementCardData(recommendation),
    ),
  }
}

export function replaceRecommendationInPlan({
  plan,
  indexToReplace,
  profile = {},
  currentWorkplace,
  currentPhase,
  currentWorkdayType,
  currentDate,
  reason = '',
}) {
  const currentSchedule = Array.isArray(plan?.dailySchedule)
    ? plan.dailySchedule
    : []
  const originalSection = currentSchedule[indexToReplace]

  if (!originalSection) {
    return {
      plan,
      replaced: false,
      replacement: null,
      message: 'Ich habe gerade keine passendere Alternative gefunden.',
    }
  }

  const context = normalizeContext({
    ...profile,
    currentPhase,
    currentWorkplace,
    currentWorkdayType,
    currentDate,
  })
  const replacementReason = normalizeReplacementReason(reason)
  const replacement = pickReplacementRecommendation({
    context,
    currentSchedule,
    indexToReplace,
    originalSection,
    reason: replacementReason,
  })

  if (!replacement) {
    return {
      plan,
      replaced: false,
      replacement: null,
      message: 'Ich habe gerade keine passendere Alternative gefunden.',
    }
  }

  const replacementSection = toScheduleSection(
    replacement,
    getSlotDefinitionFromSection(originalSection, currentSchedule.length, indexToReplace),
    context,
  )
  const nextSchedule = currentSchedule.map((section, index) =>
    index === indexToReplace ? replacementSection : section,
  )

  return {
    plan: {
      ...plan,
      dailySchedule: nextSchedule,
    },
    replaced: true,
    replacement: replacementSection,
    replacedSection: originalSection,
    message: '',
  }
}

function normalizeContext(answers) {
  const profile = normalizeProfileAnswers(answers)
  const currentDate = normalizeDate(answers?.currentDate ?? answers?.date)
  const currentWorkdayType = isValidWorkdayType(answers?.currentWorkdayType)
    ? answers.currentWorkdayType
    : profile.situation
  const currentPhase = normalizeWorkPhase(
    answers?.currentPhase ?? deriveWorkPhaseFromWorkday(currentWorkdayType),
  )
  const requestedWorkplace = answers?.currentWorkplace ?? profile.currentWorkplace
  const currentWorkplace = profile.workplaces.includes(requestedWorkplace)
    ? requestedWorkplace
    : profile.defaultWorkplace
  const setup = profile.workplaceSetups[currentWorkplace] ?? ['no-equipment']

  return {
    ...profile,
    situation: currentWorkdayType,
    currentPhase,
    currentWorkplace,
    currentDate,
    currentDateKey: formatDateKey(currentDate),
    recommendationFeedback: loadRecommendationFeedback(),
    recommendationHistory: loadRecommendationHistory(currentDate),
    setup,
  }
}

function getMatchingRecommendations(context) {
  const ideal = movementRecommendations.filter((recommendation) =>
    isRecommendationIdeal(recommendation, context),
  )
  const strict = movementRecommendations.filter((recommendation) =>
    isRecommendationAvailable(recommendation, context),
  )
  const good = movementRecommendations.filter((recommendation) =>
    isRecommendationGoodFallback(recommendation, context),
  )
  const safe = movementRecommendations.filter((recommendation) =>
    isSafeBasisRecommendation(recommendation, context),
  )
  const candidates = uniqueRecommendations([...ideal, ...strict, ...good, ...safe])

  if (candidates.length >= maximumRecommendations) {
    return candidates
  }

  return uniqueRecommendations([
    ...candidates,
    ...movementRecommendations.filter((recommendation) =>
      canUseRecommendationSetup(recommendation, context),
    ),
  ])
}

function pickReplacementRecommendation({
  context,
  currentSchedule,
  indexToReplace,
  originalSection,
  reason,
}) {
  const originalRuleId = originalSection.ruleId ?? originalSection.id
  const existingRuleIds = new Set(
    currentSchedule
      .filter((_, index) => index !== indexToReplace)
      .map((section) => section.ruleId ?? section.id),
  )
  const slotRole = getSlotRole(currentSchedule.length, indexToReplace)
  const scheduleContext = currentSchedule.filter((_, index) => index !== indexToReplace)
  const slotDefinition = getSlotDefinitionFromSection(
    originalSection,
    currentSchedule.length,
    indexToReplace,
  )
  const availableCandidates = movementRecommendations
    .filter((recommendation) => canUseRecommendationSetup(recommendation, context))
    .filter((recommendation) =>
      relaxedIntensities[context.fitnessLevel]?.includes(recommendation.intensity),
    )
    .filter((recommendation) => recommendation.id !== originalRuleId)
    .filter(
      (recommendation) =>
        !violatesMiniResetReplacementLimits(
          recommendation,
          scheduleContext,
          context,
          slotDefinition,
          reason,
        ),
    )

  const preferredCandidates = getReasonPreferredReplacementCandidates(
    availableCandidates,
    originalSection,
    reason,
  )
  const candidatePools = [
    ...buildReplacementCandidatePools(
      preferredCandidates,
      existingRuleIds,
      originalSection,
    ),
    ...buildReplacementCandidatePools(
      availableCandidates,
      existingRuleIds,
      originalSection,
    ),
  ]

  const candidates = candidatePools.find((pool) => pool.length > 0) ?? []

  if (!candidates.length) {
    return null
  }

  return [...candidates].sort(
    (first, second) =>
      scoreReplacementRecommendation(
        second,
        context,
        scheduleContext,
        slotRole,
        slotDefinition,
        originalSection,
        reason,
      ) -
      scoreReplacementRecommendation(
        first,
        context,
        scheduleContext,
        slotRole,
        slotDefinition,
        originalSection,
        reason,
      ),
  )[0]
}

function buildReplacementCandidatePools(candidates, existingRuleIds, originalSection) {
  return [
    candidates.filter(
      (recommendation) =>
        !existingRuleIds.has(recommendation.id) &&
        recommendation.similarityGroup !== originalSection.similarityGroup,
    ),
    candidates.filter((recommendation) => !existingRuleIds.has(recommendation.id)),
    candidates.filter(
      (recommendation) =>
        recommendation.similarityGroup !== originalSection.similarityGroup,
    ),
    candidates,
    candidates.filter(
      (recommendation) =>
        !existingRuleIds.has(recommendation.id) &&
        hasNoSpecialSetup(recommendation.requiredSetup) &&
        ['gentle', 'balanced'].includes(recommendation.intensity),
    ),
  ]
}

function getReasonPreferredReplacementCandidates(
  candidates,
  originalSection,
  reason,
) {
  if (isTimeReplacementReason(reason)) {
    const shorterCandidates = candidates.filter((recommendation) =>
      isMeaningfullyShorterReplacement(recommendation, originalSection),
    )

    if (shorterCandidates.length) {
      return shorterCandidates
    }

    return candidates.filter((recommendation) =>
      isShorterReplacement(recommendation, originalSection),
    )
  }

  if (reason === 'too-visible') {
    return candidates.filter((recommendation) =>
      hasLowerVisibility(recommendation, originalSection),
    )
  }

  if (reason === 'no-space') {
    return candidates.filter(isSpaceSavingReplacement)
  }

  if (reason === 'too-hard') {
    return candidates.filter((recommendation) =>
      isEasierReplacement(recommendation, originalSection),
    )
  }

  if (reason === 'calmer') {
    return candidates.filter(isCalmReplacement)
  }

  if (reason === 'walk') {
    return candidates.filter(isMovementOrientedReplacement)
  }

  if (reason === 'setup-mismatch') {
    return candidates.filter((recommendation) =>
      hasNoSpecialSetup(recommendation.requiredSetup),
    )
  }

  return candidates
}

function scoreReplacementRecommendation(
  recommendation,
  context,
  schedule,
  slotRole,
  slotDefinition,
  originalSection,
  reason,
) {
  return (
    scoreRecommendation(recommendation, context, schedule, slotRole, slotDefinition, {
      replacementReason: reason,
    }) +
    getSlotSpecificReplacementScore(recommendation, slotDefinition, reason) +
    getReplacementReasonScore(recommendation, reason, originalSection, context) +
    getReplacementDiversityScore(recommendation, originalSection)
  )
}

function isRecommendationAvailable(recommendation, context) {
  return (
    canUseRecommendationSetup(recommendation, context) &&
    allowedIntensities[context.fitnessLevel]?.includes(recommendation.intensity)
  )
}

function isRecommendationIdeal(recommendation, context) {
  return (
    isRecommendationAvailable(recommendation, context) &&
    recommendation.suitableGoals.includes(context.goal) &&
    recommendation.suitablePhases.includes(context.currentPhase) &&
    recommendationMatchesWorkdayType(recommendation, context.situation)
  )
}

function isRecommendationGoodFallback(recommendation, context) {
  return (
    canUseRecommendationSetup(recommendation, context) &&
    relaxedIntensities[context.fitnessLevel]?.includes(recommendation.intensity) &&
    (
      recommendation.suitableGoals.includes(context.goal) ||
      recommendation.suitablePhases.includes(context.currentPhase)
    )
  )
}

function isSafeBasisRecommendation(recommendation, context) {
  return (
    recommendation.suitableWorkplaces.includes(context.currentWorkplace) &&
    hasNoSpecialSetup(recommendation.requiredSetup) &&
    ['gentle', 'balanced'].includes(recommendation.intensity) &&
    ['discreet', 'normal'].includes(recommendation.visibilityLevel)
  )
}

function canUseRecommendationSetup(recommendation, context) {
  return (
    recommendation.suitableWorkplaces.includes(context.currentWorkplace) &&
    hasRequiredSetup(recommendation.requiredSetup, context.setup)
  )
}

function sortRecommendations(recommendations, context) {
  return [...recommendations].sort(
    (first, second) => scoreRecommendation(second, context) - scoreRecommendation(first, context),
  )
}

function scoreRecommendation(
  recommendation,
  context,
  schedule = [],
  slotRole = '',
  slotDefinition = null,
  options = {},
) {
  let score = recommendation.priority

  if (recommendation.suitableGoals.includes(context.goal)) {
    score += 34
  }

  if (recommendation.suitablePhases.includes(context.currentPhase)) {
    score += 32
  }

  if (recommendationMatchesWorkdayType(recommendation, context.situation)) {
    score += 18
  }

  if (recommendation.intensity === preferredIntensity(context.fitnessLevel)) {
    score += 14
  }

  score += goalMovementTypeScores[context.goal]?.[recommendation.movementType] ?? 0
  score += phaseMovementTypeScores[context.currentPhase]?.[recommendation.movementType] ?? 0
  score += slotMovementTypeScores[slotRole]?.[recommendation.movementType] ?? 0
  score += getSlotBodyAreaScore(recommendation, slotRole)
  score += workdayMovementTypeScores[context.situation]?.[recommendation.movementType] ?? 0
  score += getWorkdayBodyAreaScore(recommendation, context.situation)
  score += slotPositionScores[slotRole]?.[recommendation.position] ?? 0
  score += slotVisibilityScores[slotRole]?.[recommendation.visibilityLevel] ?? 0
  score += getSpecialSetupCount(recommendation.requiredSetup) * 12

  if (context.currentWorkplace === 'homeoffice' && recommendation.id.startsWith('home-')) {
    score += 18
  }

  if (context.currentWorkplace === 'office' && recommendation.id.startsWith('office-')) {
    score += 18
  }

  if (
    context.currentPhase === 'focus' &&
    recommendation.durationMinutes > 5 &&
    !['eyes', 'breathing'].includes(recommendation.movementType)
  ) {
    score -= 28
  }

  if (context.currentPhase === 'meeting' && recommendation.movementType === 'walk') {
    score -= context.setup.includes('walking-pad') || context.setup.includes('hallway') ? 0 : 24
  }

  if (context.currentPhase === 'meeting') {
    score += getMeetingVisibilityScore(recommendation.visibilityLevel)
  }

  if (isMiniReset(recommendation)) {
    score += getMiniResetContextScore(recommendation, context, schedule, slotRole)
  }

  if (context.situation === 'study-day') {
    if (recommendation.durationMinutes <= 3) {
      score += 16
    }

    if (recommendation.durationMinutes > 5) {
      score -= 24
    }
  }

  if (context.situation === 'tight-schedule') {
    if (recommendation.durationMinutes <= 2) {
      score += 42
    } else if (recommendation.durationMinutes === 3) {
      score += 14
    } else {
      score -= 38
    }

    score += recommendation.visibilityLevel === 'discreet' ? 22 : 0
    score += recommendation.visibilityLevel === 'visible' ? -44 : 0
    score += hasNoSpecialSetup(recommendation.requiredSetup) ? 18 : -22
    score += recommendation.intensity === 'gentle' ? 16 : 0
    score += recommendation.intensity === 'active' ? -22 : 0
  }

  score += getPhaseVisibilityScore(recommendation, context)
  score += getWorkplaceVisibilityScore(recommendation, context)
  score += getPositionTransitionScore(recommendation, context, schedule)
  score += getSetupContextScore(recommendation, context, schedule, slotRole)
  score += getBodyAreaDiversityScore(recommendation, schedule)

  score -= schedulePenalty(recommendation, schedule)
  score -= getRecommendationHistoryPenalty(recommendation, context)
  score -= getRecommendationFeedbackPenalty(
    recommendation,
    context,
    slotRole,
    slotDefinition,
    options,
  )

  return score
}

function schedulePenalty(recommendation, schedule) {
  const last = schedule.at(-1)
  let penalty = 0

  if (last?.movementType === recommendation.movementType) {
    penalty += 72
  }

  if (last?.movementType === 'stand' && recommendation.movementType === 'stand') {
    penalty += 130
  }

  if (schedule.some((item) => item.id === recommendation.id)) {
    penalty += 120
  }

  if (schedule.some((item) => item.similarityGroup === recommendation.similarityGroup)) {
    penalty += 52
  }

  if (
    last?.position &&
    recommendation.position &&
    last.position === recommendation.position &&
    recommendation.position !== 'mixed'
  ) {
    penalty += recommendation.position === 'standing' ? 48 : 28
  }

  const lastBodyAreaOverlap = countBodyAreaOverlap(last?.bodyArea, recommendation.bodyArea)
  penalty += lastBodyAreaOverlap * 18

  penalty += schedule.filter((item) =>
    countBodyAreaOverlap(item.bodyArea, recommendation.bodyArea) > 0,
  ).length * 7

  penalty += schedule.filter(
    (item) => item.movementType === recommendation.movementType,
  ).length * 14

  if (isMiniReset(recommendation)) {
    penalty += countMiniResets(schedule) * 90

    if (countMiniResets(schedule) >= 1) {
      penalty += 80
    }
  }

  if (countMatchingMovementType(schedule, recommendation.movementType) >= 2) {
    penalty += 42
  }

  if (
    recommendation.visibilityLevel === 'visible' &&
    schedule.filter((item) => item.visibilityLevel === 'visible').length >= 1
  ) {
    penalty += 24
  }

  if (
    usesSpecialSetup(recommendation) &&
    countSpecialSetupRecommendations(schedule) >= 2
  ) {
    penalty += 42
  }

  if (
    usesSpecialSetup(recommendation) &&
    schedule.some((item) =>
      getPrimarySpecialSetup(item.requiredSetup) ===
      getPrimarySpecialSetup(recommendation.requiredSetup),
    )
  ) {
    penalty += 24
  }

  return penalty
}

function getRecommendationHistoryPenalty(recommendation, context) {
  const history = Array.isArray(context.recommendationHistory)
    ? context.recommendationHistory
    : []

  return history.reduce((total, entry) => {
    if (
      entry.date === context.currentDateKey ||
      !entry.ruleIds?.includes(recommendation.id)
    ) {
      return total
    }

    const ageInDays = getDateDistanceInDays(entry.date, context.currentDateKey)

    if (ageInDays <= 0 || ageInDays > 14) {
      return total
    }

    return total + Math.max(8, 52 - ageInDays * 4)
  }, 0)
}

function getRecommendationFeedbackPenalty(
  recommendation,
  context,
  slotRole,
  slotDefinition,
  { replacementReason = '' } = {},
) {
  const feedbackEntries = Array.isArray(context.recommendationFeedback)
    ? context.recommendationFeedback
    : []
  const penalty = feedbackEntries.reduce(
    (total, feedbackEntry) =>
      total +
      getSingleRecommendationFeedbackPenalty(recommendation, context, {
        feedbackEntry,
        replacementReason,
        slotDefinition,
        slotRole,
      }),
    0,
  )

  return Math.min(48, penalty)
}

function getSingleRecommendationFeedbackPenalty(
  recommendation,
  context,
  { feedbackEntry, replacementReason, slotDefinition, slotRole },
) {
  if (
    feedbackEntry?.feedback !== 'not-fit' ||
    feedbackEntry.recommendationId !== recommendation.id
  ) {
    return 0
  }

  const ageInDays = getDateDistanceInDays(feedbackEntry.date, context.currentDateKey)

  if (ageInDays < 0 || ageInDays > recommendationFeedbackWindowDays) {
    return 0
  }

  const entryWorkplace = feedbackEntry.currentWorkplace ?? feedbackEntry.workplace
  const entryPhase = feedbackEntry.currentPhase ?? feedbackEntry.phase
  const entrySlotRole = getSlotRoleFromSlotId(feedbackEntry.slotId)
  const entryReason = feedbackEntry.replacementReason ?? feedbackEntry.reason ?? ''
  let contextMatchScore = 0
  let additionalContextMatches = 0

  if (entryWorkplace) {
    if (entryWorkplace !== context.currentWorkplace) {
      return 0
    }

    contextMatchScore += 10
  }

  if (feedbackEntry.workdayType && feedbackEntry.workdayType === context.situation) {
    contextMatchScore += 8
    additionalContextMatches += 1
  }

  if (entryPhase && entryPhase === context.currentPhase) {
    contextMatchScore += 6
    additionalContextMatches += 1
  }

  if (feedbackEntry.slotId && feedbackEntry.slotId === slotDefinition?.slotId) {
    contextMatchScore += 8
    additionalContextMatches += 1
  } else if (entrySlotRole && entrySlotRole === slotRole) {
    contextMatchScore += 5
    additionalContextMatches += 1
  }

  if (entryReason && replacementReason && entryReason === replacementReason) {
    contextMatchScore += 8
    additionalContextMatches += 1
  }

  if (
    entryReason === 'too-visible' &&
    context.currentWorkplace === 'office' &&
    ['focus', 'meeting'].includes(context.currentPhase)
  ) {
    contextMatchScore += 6
    additionalContextMatches += 1
  }

  if (additionalContextMatches < 1 || contextMatchScore < 10) {
    return 0
  }

  const recencyMultiplier = ageInDays <= 14 ? 1 : 0.6
  const replacementSignal = feedbackEntry.action === 'replaced' ? 4 : 0

  return Math.round(Math.min(36, 8 + contextMatchScore + replacementSignal) * recencyMultiplier)
}

function buildDailySchedule(sortedRecommendations, context) {
  const scheduleLength = getScheduleLength(context)
  const slotDefinitions = getSlotDefinitions(scheduleLength)
  const schedule = []

  for (const slotDefinition of slotDefinitions) {
    const slotRole = slotDefinition.slotRole ?? 'movement'
    const recommendation =
      pickNextRecommendation(
        sortedRecommendations,
        schedule,
        context,
        slotRole,
        slotDefinition,
      ) ??
      pickNextRecommendation(
        sortedRecommendations,
        schedule,
        context,
        slotRole,
        slotDefinition,
        {
          allowSimilarity: true,
        },
      ) ??
      pickNextRecommendation(
        sortedRecommendations,
        schedule,
        context,
        slotRole,
        slotDefinition,
        {
          allowDiversityFallback: true,
          allowSequenceFallback: true,
          allowSimilarity: true,
        },
      )

    if (!recommendation) {
      continue
    }

    schedule.push(toScheduleSection(recommendation, slotDefinition, context))
  }

  return protectDailyScheduleValue(
    schedule,
    sortedRecommendations,
    context,
    slotDefinitions,
  )
}

function pickNextRecommendation(
  candidates,
  currentSchedule,
  context,
  slotRole,
  slotDefinition,
  {
    allowDiversityFallback = false,
    allowSequenceFallback = false,
    allowSimilarity = false,
  } = {},
) {
  const sorted = [...candidates].sort(
    (first, second) =>
      scoreRecommendation(second, context, currentSchedule, slotRole, slotDefinition) -
      scoreRecommendation(first, context, currentSchedule, slotRole, slotDefinition),
  )

  return sorted.find((candidate) => {
    if (currentSchedule.some((section) => section.ruleId === candidate.id)) {
      return false
    }

    if (!allowSimilarity && isTooSimilar(candidate, currentSchedule)) {
      return false
    }

    if (!allowDiversityFallback && exceedsSoftDiversityLimit(candidate, currentSchedule)) {
      return false
    }

    if (violatesMiniResetPlanLimits(candidate, currentSchedule, context, slotDefinition)) {
      return false
    }

    return allowSequenceFallback || canFollow(currentSchedule.at(-1), candidate)
  })
}

function protectDailyScheduleValue(schedule, candidates, context, slotDefinitions) {
  const protectedSchedule = [...schedule]
  const minimumSubstantiveCount = getMinimumSubstantiveCount(context)
  const maximumMiniResetCount = getMaximumMiniResetCount(context)
  const maximumTinyResetCount = context.situation === 'tight-schedule' ? 2 : 1

  for (let index = protectedSchedule.length - 1; index >= 0; index -= 1) {
    const section = protectedSchedule[index]
    const slotDefinition = slotDefinitions[index]
    const needsReplacement =
      (isMiniReset(section) && countMiniResets(protectedSchedule) > maximumMiniResetCount) ||
      (
        isMiniReset(section) &&
        countSubstantiveRecommendations(protectedSchedule) < minimumSubstantiveCount
      ) ||
      (
        isTinyMiniReset(section) &&
        countTinyMiniResets(protectedSchedule) > maximumTinyResetCount
      ) ||
      (
        slotDefinition?.slotId === 'lunch_transition' &&
        isTinyMiniReset(section)
      )

    if (!needsReplacement) {
      continue
    }

    const replacement = pickValueGuardReplacement({
      candidates,
      context,
      currentSchedule: protectedSchedule,
      indexToReplace: index,
      slotDefinition,
    })

    if (replacement) {
      protectedSchedule[index] = toScheduleSection(replacement, slotDefinition, context)
    }
  }

  return protectedSchedule
}

function pickValueGuardReplacement({
  candidates,
  context,
  currentSchedule,
  indexToReplace,
  slotDefinition,
}) {
  const scheduleContext = currentSchedule.filter((_, index) => index !== indexToReplace)
  const existingRuleIds = new Set(
    scheduleContext.map((section) => section.ruleId ?? section.id),
  )
  const previousSection = currentSchedule[indexToReplace - 1]
  const nextSection = currentSchedule[indexToReplace + 1]
  const slotRole = slotDefinition?.slotRole ?? 'movement'

  return [...candidates]
    .filter((candidate) => !isMiniReset(candidate))
    .filter((candidate) => !existingRuleIds.has(candidate.id))
    .filter((candidate) => !isTooSimilar(candidate, scheduleContext))
    .filter((candidate) => canFollow(previousSection, candidate))
    .filter((candidate) => canFollow(candidate, nextSection))
    .sort(
      (first, second) =>
        scoreRecommendation(second, context, scheduleContext, slotRole, slotDefinition) -
        scoreRecommendation(first, context, scheduleContext, slotRole, slotDefinition),
    )[0]
}

function avoidBadSequences(recommendations, recommendationCount) {
  const plan = []
  const candidates = [...recommendations]

  while (plan.length < recommendationCount && candidates.length) {
    const nextIndex = candidates.findIndex((candidate) =>
      canFollow(plan.at(-1), candidate),
    )

    if (nextIndex === -1) {
      break
    }

    const [nextRecommendation] = candidates.splice(nextIndex, 1)
    plan.push(nextRecommendation)
  }

  return plan.slice(0, maximumRecommendations)
}

function ensureMinimumRecommendations(
  recommendations,
  existingCandidates,
  context,
  recommendationCount,
) {
  if (recommendations.length >= minimumRecommendations) {
    return recommendations
  }

  const fallbackRecommendations = movementRecommendations
    .filter((recommendation) => isRecommendationAvailable(recommendation, context))
    .filter(
      (recommendation) =>
        !existingCandidates.some((candidate) => candidate.id === recommendation.id) &&
        !recommendations.some((selected) => selected.id === recommendation.id),
    )

  return avoidBadSequences(
    [...recommendations, ...sortRecommendations(fallbackRecommendations, context)],
    recommendationCount,
  )
}

function canFollow(previousItem, nextRecommendation) {
  if (!previousItem) {
    return true
  }

  if (previousItem.movementType === nextRecommendation.movementType) {
    return false
  }

  if (
    previousItem.movementType === 'stand' &&
    nextRecommendation.movementType === 'stand'
  ) {
    return false
  }

  if (
    ['walk', 'walking_meeting'].includes(previousItem.movementType) &&
    nextRecommendation.movementType === 'activate'
  ) {
    return false
  }

  if (isIntense(previousItem.intensity) && isIntense(nextRecommendation.intensity)) {
    return false
  }

  return true
}

function isTooSimilar(recommendation, schedule) {
  return schedule.some(
    (section) => section.similarityGroup === recommendation.similarityGroup,
  )
}

function getScheduleLength() {
  return 5
}

function getSlotRole(scheduleLength, index) {
  return getSlotDefinitions(scheduleLength)[index]?.slotRole ?? 'movement'
}

function getSlotDefinitions(scheduleLength) {
  return scheduleLength === 5 ? defaultDaySlotWindows : defaultDaySlotWindows
}

function getRecommendationCount() {
  return maximumRecommendations
}

function toMovementCardData(recommendation) {
  return {
    bodyArea: recommendation.bodyArea,
    description: recommendation.description,
    displaySetup: formatSetup(recommendation.requiredSetup),
    duration: formatDuration(recommendation.durationMinutes),
    explanation: recommendation.explanation,
    id: recommendation.id,
    instructionSteps: recommendation.instructionSteps,
    intensity: intensityLabels[recommendation.intensity],
    movementType: recommendation.movementType,
    position: recommendation.position,
    reason: recommendation.reason,
    ruleType: movementTypeLegacyTypes[recommendation.movementType],
    setup: formatSetup(recommendation.requiredSetup),
    title: recommendation.title,
    type: recommendation.movementType,
    visibilityLevel: recommendation.visibilityLevel,
  }
}

function toScheduleSection(recommendation, slotDefinitionOrLabel, context) {
  const slotDefinition =
    typeof slotDefinitionOrLabel === 'string'
      ? createLegacySlotDefinition(slotDefinitionOrLabel)
      : slotDefinitionOrLabel
  const timeLabel = slotDefinition.slotLabel

  return {
    bodyArea: recommendation.bodyArea,
    description: recommendation.description,
    duration: formatDuration(recommendation.durationMinutes),
    durationMinutes: recommendation.durationMinutes,
    explanation: recommendation.explanation,
    id: `${timeLabel.toLowerCase().replaceAll(' ', '-')}-${recommendation.id}`,
    instructionSteps: recommendation.instructionSteps,
    intensity: intensityLabels[recommendation.intensity],
    movementType: recommendation.movementType,
    position: recommendation.position,
    reason: buildReason(recommendation, context),
    ruleId: recommendation.id,
    ruleType: movementTypeLegacyTypes[recommendation.movementType],
    requiredSetup: recommendation.requiredSetup,
    setup: formatSetup(recommendation.requiredSetup),
    similarityGroup: recommendation.similarityGroup,
    slotId: slotDefinition.slotId,
    slotLabel: slotDefinition.slotLabel,
    slotWindowMeta: slotDefinition.slotWindowMeta,
    timeLabel,
    title: recommendation.title,
    visibilityLevel: recommendation.visibilityLevel,
  }
}

function buildReason(recommendation, context) {
  const phaseLabel = getOptionLabel(workPhaseOptions, context.currentPhase)

  if (isMiniReset(recommendation)) {
    if (context.situation === 'tight-schedule') {
      return 'Ein sehr kurzer Reset fuer volle Tage.'
    }

    if (context.currentPhase === 'focus' || context.currentPhase === 'meeting') {
      return 'Kurz unterbrechen statt komplett ausfallen lassen.'
    }

    return 'Passt, wenn gerade kaum Zeit fuer eine laengere Uebung ist.'
  }

  if (recommendation.requiredSetup.includes('walking-pad')) {
    return 'Das Walking Pad ist an deinem aktuellen Arbeitsort verfügbar und passt zu diesem Impuls.'
  }

  if (recommendation.requiredSetup.includes('stairs')) {
    return 'Ein kurzer Treppenimpuls aktiviert, ohne dass daraus ein Training werden muss.'
  }

  if (recommendation.requiredSetup.includes('hallway')) {
    return context.currentWorkplace === 'office'
      ? 'Nutze einen kurzen Weg im Büro, um eine längere Sitzphase zu unterbrechen.'
      : 'Ein kurzer Weg hilft dir, im Arbeitstag bewusst Bewegung einzubauen.'
  }

  if (context.currentWorkplace === 'homeoffice' && recommendation.id.startsWith('home-')) {
    return 'Im Homeoffice fehlen oft natürliche Wege. Diese Empfehlung schafft bewusst einen kurzen Bewegungsanlass.'
  }

  if (
    context.currentWorkplace === 'office' &&
    hasNoSpecialSetup(recommendation.requiredSetup) &&
    ['mobilize', 'sit_reset', 'stand', 'walk'].includes(recommendation.movementType)
  ) {
    return 'Im Büro lassen sich kurze Wechsel gut nutzen, um lange Sitzphasen zu unterbrechen.'
  }

  if (recommendation.suitablePhases.includes(context.currentPhase)) {
    return `Passt gerade zu ${phaseLabel}: ${recommendation.reason}`
  }

  return recommendation.reason
}

function buildRhythm(context) {
  if (context.currentPhase === 'meeting') {
    return 'Für Meetings stehen diskrete Positionswechsel im Vordergrund. Walking-Impulse erscheinen nur, wenn das Setup passt.'
  }

  if (context.currentPhase === 'phone') {
    return 'Bei Telefonaten werden Gehen, Stehen oder lockere Bewegung stärker berücksichtigt.'
  }

  if (context.situation === 'focus-heavy') {
    return 'Der Plan setzt auf kurze, ruhige Microbreaks zwischen Fokusblöcken.'
  }

  if (context.setup.includes('hallway')) {
    return 'Kurze Wege werden bewusst als Sitzunterbrechung genutzt.'
  }

  if (context.setup.includes('stairs')) {
    return 'Treppenimpulse bleiben kurz und aktivierend, damit sie in den Arbeitstag passen.'
  }

  return 'Der Plan mischt Mobilisieren, Positionswechsel, kurze Gehimpulse und Entlastung über den Arbeitstag.'
}

function buildSummary(context) {
  const goalLabel = getOptionLabel(goalOptions, context.goal)
  const workdayLabel = getOptionLabel(workdayOptions, context.situation)
  const intensityLabel = getOptionLabel(intensityOptions, context.fitnessLevel)
  const workplaceLabel = getOptionLabel(workplaceOptions, context.currentWorkplace)
  const setupLabel = context.setup
    .map((setup) => getSetupLabel(setup))
    .join(', ')

  return `${goalLabel} mit ${intensityLabel.toLowerCase()}en Empfehlungen: dein Plan orientiert sich an ${setupLabel}, ${workdayLabel.toLowerCase()} und ${workplaceLabel}.`
}

function formatSetup(requiredSetup) {
  if (hasNoSpecialSetup(requiredSetup)) {
    return 'Kein besonderes Equipment'
  }

  return requiredSetup.map((setup) => getSetupLabel(setup)).join(', ')
}

function uniqueRecommendations(recommendations) {
  return [
    ...new Map(
      recommendations.map((recommendation) => [recommendation.id, recommendation]),
    ).values(),
  ]
}

function hasRequiredSetup(requiredSetup, availableSetup) {
  return requiredSetup.every((setup) =>
    setup === 'no-equipment' || hasAvailableSetup(setup, availableSetup),
  )
}

function hasNoSpecialSetup(requiredSetup) {
  return (
    !requiredSetup.length ||
    requiredSetup.every((setup) => setup === 'no-equipment')
  )
}

function getSpecialSetupCount(requiredSetup) {
  return requiredSetup.filter((setup) => setup !== 'no-equipment').length
}

function usesSpecialSetup(recommendation) {
  return getSpecialSetupCount(recommendation.requiredSetup ?? []) > 0
}

function countSpecialSetupRecommendations(schedule) {
  return schedule.filter((item) => usesSpecialSetup(item)).length
}

function getPrimarySpecialSetup(requiredSetup = []) {
  return requiredSetup.find((setup) => setup !== 'no-equipment') ?? ''
}

function getSetupLabel(setup) {
  return setupDisplayLabels[setup] ?? getOptionLabel(setupOptions, setup)
}

function hasAvailableSetup(setup, availableSetup) {
  if (setup === 'small-equipment') {
    return concreteSmallEquipmentIds.some((equipmentId) =>
      availableSetup.includes(equipmentId),
    ) || availableSetup.includes(setup)
  }

  return availableSetup.includes(setup)
}

function getSlotBodyAreaScore(recommendation, slotRole) {
  return recommendation.bodyArea.reduce(
    (total, bodyArea) => total + (slotBodyAreaScores[slotRole]?.[bodyArea] ?? 0),
    0,
  )
}

function getWorkdayBodyAreaScore(recommendation, workdayType) {
  return recommendation.bodyArea.reduce(
    (total, bodyArea) =>
      total + (workdayBodyAreaScores[workdayType]?.[bodyArea] ?? 0),
    0,
  )
}

function recommendationMatchesWorkdayType(recommendation, workdayType) {
  if (recommendation.suitableWorkdayTypes.includes(workdayType)) {
    return true
  }

  const compatibleWorkdayTypes = {
    'study-day': ['focus-heavy', 'mixed-day'],
    'tight-schedule': ['focus-heavy', 'meeting-heavy', 'mixed-day'],
  }

  return compatibleWorkdayTypes[workdayType]?.some((compatibleWorkdayType) =>
    recommendation.suitableWorkdayTypes.includes(compatibleWorkdayType),
  ) ?? false
}

function getSlotDefinitionFromSection(section, scheduleLength, index) {
  const defaultSlotDefinition =
    getSlotDefinitions(scheduleLength)[index] ?? createLegacySlotDefinition(section.timeLabel)

  return {
    slotId: section.slotId ?? defaultSlotDefinition.slotId,
    slotLabel: section.slotLabel ?? section.timeLabel ?? defaultSlotDefinition.slotLabel,
    slotRole: defaultSlotDefinition.slotRole,
    slotWindowMeta: section.slotWindowMeta ?? defaultSlotDefinition.slotWindowMeta,
  }
}

function createLegacySlotDefinition(timeLabel) {
  const matchedSlot = defaultDaySlotWindows.find(
    (slotDefinition) => slotDefinition.slotLabel === timeLabel,
  )

  if (matchedSlot) {
    return matchedSlot
  }

  return {
    slotId: timeLabel?.toLowerCase().replaceAll(' ', '_') ?? 'slot',
    slotLabel: timeLabel ?? 'Empfehlung',
    slotRole: 'movement',
    slotWindowMeta: null,
  }
}

function getMeetingVisibilityScore(visibilityLevel) {
  if (visibilityLevel === 'discreet') {
    return 32
  }

  if (visibilityLevel === 'normal') {
    return -4
  }

  if (visibilityLevel === 'visible') {
    return -48
  }

  return 0
}

function getOfficeVisibilityScore(visibilityLevel) {
  if (visibilityLevel === 'discreet') {
    return 10
  }

  if (visibilityLevel === 'visible') {
    return -18
  }

  return 0
}

function getPhaseVisibilityScore(recommendation, context) {
  if (context.currentPhase === 'focus') {
    if (recommendation.visibilityLevel === 'discreet') {
      return 14
    }

    if (recommendation.visibilityLevel === 'normal') {
      return 8
    }

    return context.currentWorkplace === 'office' ? -18 : -4
  }

  if (context.currentPhase === 'phone') {
    if (['walk', 'walking_meeting'].includes(recommendation.movementType)) {
      return 18
    }

    return recommendation.visibilityLevel === 'visible' ? 4 : 8
  }

  if (context.currentPhase === 'break') {
    return recommendation.visibilityLevel === 'discreet' ? 2 : 14
  }

  if (context.currentPhase === 'between-tasks') {
    if (recommendation.visibilityLevel === 'visible') {
      return context.currentWorkplace === 'homeoffice' ? 6 : -4
    }

    return 8
  }

  return 0
}

function getWorkplaceVisibilityScore(recommendation, context) {
  if (context.currentWorkplace === 'office' && context.currentPhase !== 'break') {
    return getOfficeVisibilityScore(recommendation.visibilityLevel)
  }

  if (
    context.currentWorkplace === 'homeoffice' &&
    ['break', 'between-tasks'].includes(context.currentPhase) &&
    ['normal', 'visible'].includes(recommendation.visibilityLevel)
  ) {
    return 8
  }

  return 0
}

function getPositionTransitionScore(recommendation, context, schedule) {
  const last = schedule.at(-1)
  let score = 0

  if (last?.position === 'sitting' && recommendation.position === 'walking') {
    score += 24
  }

  if (
    last?.position === 'sitting' &&
    recommendation.position === 'mixed' &&
    (last.durationMinutes ?? 0) >= 5
  ) {
    score += 14
  }

  if (recommendation.position === 'floor') {
    score += context.currentWorkplace === 'homeoffice' ? 16 : -26
    score += context.currentPhase === 'break' ? 18 : -10
  }

  if (recommendation.position === 'stairs') {
    score += context.currentPhase === 'break' ? 14 : 0
  }

  return score
}

function getSetupContextScore(recommendation, context, schedule, slotRole) {
  const primarySetup = getPrimarySpecialSetup(recommendation.requiredSetup)
  let score = 0

  if (!primarySetup) {
    return score
  }

  if (primarySetup === 'walking-pad') {
    score += ['phone', 'meeting'].includes(context.currentPhase) ? 38 : 4
    score += ['movement', 'relief'].includes(slotRole) ? 18 : 0
    score += recommendation.movementType === 'walking_meeting' ? 22 : 0
    score += recommendation.movementType === 'walk' ? 12 : 0
    score += context.currentPhase === 'focus' && slotRole === 'focus' ? -18 : 0
  }

  if (primarySetup === 'stairs') {
    score += context.currentPhase === 'break' ? 30 : 0
    score += ['movement', 'relief'].includes(slotRole) ? 24 : -8
    score += slotRole === 'focus' ? -28 : 0
    score += context.currentPhase === 'meeting' ? -18 : 0
    score += ['balanced', 'active'].includes(recommendation.intensity) ? 8 : 0
  }

  if (primarySetup === 'hallway') {
    score += recommendation.movementType === 'walk' ? 30 : 0
    score += ['phone', 'between-tasks'].includes(context.currentPhase) ? 18 : 0
    score += ['movement', 'relief'].includes(slotRole) ? 16 : 0
    score += context.currentPhase === 'focus' && slotRole === 'focus' ? -12 : 0
  }

  if (primarySetup === 'standing-desk') {
    score += ['stand', 'sit_reset'].includes(recommendation.movementType) ? 28 : 8
    score += ['focus', 'closing'].includes(slotRole) ? 10 : 0
    score += schedule.at(-1)?.position === 'sitting' ? 18 : 0
    score +=
      context.currentPhase === 'focus' && recommendation.durationMinutes > 5
        ? -42
        : 0
  }

  if (primarySetup === 'ergonomic-support') {
    score += recommendation.movementType === 'sit_reset' ? 16 : 6
  }

  if (['small-equipment', 'space'].includes(primarySetup)) {
    score += context.currentWorkplace === 'homeoffice' ? 14 : 0
    score += context.currentPhase === 'break' ? 16 : 0
    score +=
      recommendation.visibilityLevel === 'visible' &&
      context.currentWorkplace === 'office'
        ? -10
        : 0
  }

  if (countSpecialSetupRecommendations(schedule) >= 1) {
    score -= 8
  }

  return score
}

function getBodyAreaDiversityScore(recommendation, schedule) {
  if (!schedule.length) {
    return 0
  }

  const usedBodyAreas = new Set(schedule.flatMap((item) => item.bodyArea ?? []))
  const newBodyAreas = recommendation.bodyArea.filter(
    (bodyArea) => !usedBodyAreas.has(bodyArea),
  )
  const overlap = recommendation.bodyArea.length - newBodyAreas.length

  let score = newBodyAreas.length ? 12 : -10
  score -= overlap * 6

  const mainBodyArea = recommendation.bodyArea[0]
  const mainBodyAreaCount = schedule.filter((item) =>
    item.bodyArea?.includes(mainBodyArea),
  ).length

  if (mainBodyAreaCount >= 2) {
    score -= 34
  }

  return score
}

function countBodyAreaOverlap(firstBodyArea = [], secondBodyArea = []) {
  if (!firstBodyArea || !secondBodyArea) {
    return 0
  }

  return firstBodyArea.filter((bodyArea) => secondBodyArea.includes(bodyArea)).length
}

function countMatchingMovementType(schedule, movementType) {
  return schedule.filter((item) => item.movementType === movementType).length
}

function countMiniResets(schedule) {
  return schedule.filter((item) => isMiniReset(item)).length
}

function countTinyMiniResets(schedule) {
  return schedule.filter((item) => isTinyMiniReset(item)).length
}

function countSubstantiveRecommendations(schedule) {
  return schedule.filter((item) => isSubstantiveRecommendation(item)).length
}

function isMiniReset(recommendation) {
  return recommendation?.movementType === miniResetMovementType
}

function isTinyMiniReset(recommendation) {
  return isMiniReset(recommendation) && (recommendation.durationMinutes ?? 0) <= 0.67
}

function isSubstantiveRecommendation(recommendation) {
  return (recommendation?.durationMinutes ?? 0) > 1
}

function getMaximumMiniResetCount(context) {
  if (context.situation === 'tight-schedule') {
    return 2
  }

  if (context.currentPhase === 'meeting' || context.situation === 'meeting-heavy') {
    return 2
  }

  return 1
}

function getMinimumSubstantiveCount(context) {
  return context.situation === 'tight-schedule' ? 2 : 3
}

function isMeetingContext(context) {
  return context.currentPhase === 'meeting' || context.situation === 'meeting-heavy'
}

function violatesMiniResetPlanLimits(
  recommendation,
  currentSchedule,
  context,
  slotDefinition,
) {
  if (!isMiniReset(recommendation)) {
    return false
  }

  if (countMiniResets(currentSchedule) >= getMaximumMiniResetCount(context)) {
    return true
  }

  if (slotDefinition?.slotId === 'lunch_transition' && isTinyMiniReset(recommendation)) {
    return true
  }

  if (isMeetingContext(context) && recommendation.visibilityLevel !== 'discreet') {
    return true
  }

  return false
}

function violatesMiniResetReplacementLimits(
  recommendation,
  scheduleContext,
  context,
  slotDefinition,
  reason,
) {
  if (!isMiniReset(recommendation)) {
    return false
  }

  if (countMiniResets(scheduleContext) >= getMaximumMiniResetCount(context)) {
    return true
  }

  if (slotDefinition?.slotId === 'lunch_transition' && isTinyMiniReset(recommendation)) {
    return true
  }

  if (isMeetingContext(context) && recommendation.visibilityLevel !== 'discreet') {
    return true
  }

  if (
    countSubstantiveRecommendations([...scheduleContext, recommendation]) <
    getMinimumSubstantiveCount(context)
  ) {
    return true
  }

  return reason === 'walk' && isQuietReset(recommendation)
}

function isQuietReset(recommendation) {
  return recommendation.bodyArea?.some((bodyArea) =>
    ['breathing', 'eyes'].includes(bodyArea),
  )
}

function normalizeReplacementReason(reason) {
  return reason === 'shorter' ? 'no-time' : reason
}

function isTimeReplacementReason(reason) {
  return ['no-time', 'shorter'].includes(reason)
}

function isShorterReplacement(recommendation, originalSection) {
  return getDurationSeconds(recommendation) < getDurationSeconds(originalSection)
}

function isMeaningfullyShorterReplacement(recommendation, originalSection) {
  const recommendationSeconds = getDurationSeconds(recommendation)
  const originalSeconds = getDurationSeconds(originalSection)

  return (
    recommendationSeconds < originalSeconds &&
    (
      originalSeconds - recommendationSeconds >= 30 ||
      recommendationSeconds <= originalSeconds * 0.8
    )
  )
}

function getDurationSeconds(recommendation) {
  return Math.round((recommendation?.durationMinutes ?? 0) * 60)
}

function hasLowerVisibility(recommendation, originalSection) {
  return (
    getVisibilityRank(recommendation.visibilityLevel) <
    getVisibilityRank(originalSection.visibilityLevel)
  )
}

function getVisibilityRank(visibilityLevel) {
  const ranks = {
    discreet: 0,
    normal: 1,
    visible: 2,
  }

  return ranks[visibilityLevel] ?? 1
}

function isSpaceSavingReplacement(recommendation) {
  return (
    hasNoSpecialSetup(recommendation.requiredSetup) &&
    ['sitting', 'standing', 'mixed', 'desk'].includes(recommendation.position) &&
    !['walk', 'walking_meeting', 'activate'].includes(recommendation.movementType)
  )
}

function isEasierReplacement(recommendation, originalSection) {
  return (
    getIntensityRank(recommendation.intensity) <
      getIntensityRankFromSection(originalSection.intensity) ||
    (
      recommendation.intensity === 'gentle' &&
      !['activate', 'walking_meeting'].includes(recommendation.movementType) &&
      recommendation.position !== 'stairs'
    )
  )
}

function getIntensityRank(intensity) {
  const ranks = {
    gentle: 0,
    balanced: 1,
    active: 2,
  }

  return ranks[intensity] ?? 1
}

function getIntensityRankFromSection(intensity) {
  const ranks = {
    Leicht: 0,
    Mittel: 1,
    Hoch: 2,
    gentle: 0,
    balanced: 1,
    active: 2,
  }

  return ranks[intensity] ?? 1
}

function isCalmReplacement(recommendation) {
  return (
    ['breathing', 'sit_reset', 'mobilize', 'stretch', 'mini_reset'].includes(
      recommendation.movementType,
    ) &&
    !['walk', 'walking_meeting', 'activate'].includes(recommendation.movementType) &&
    !['walking', 'stairs'].includes(recommendation.position) &&
    recommendation.intensity !== 'active'
  )
}

function isMovementOrientedReplacement(recommendation) {
  return (
    !isQuietReset(recommendation) &&
    (
      ['walk', 'walking_meeting', 'stand', 'activate'].includes(
        recommendation.movementType,
      ) ||
      ['walking', 'standing', 'mixed', 'stairs'].includes(recommendation.position)
    )
  )
}

function getMiniResetContextScore(recommendation, context, schedule, slotRole) {
  let score = 0

  if (context.situation === 'tight-schedule') {
    score += 70
  }

  if (context.currentPhase === 'focus') {
    score += 36
  }

  if (isMeetingContext(context) && recommendation.visibilityLevel === 'discreet') {
    score += 26
  }

  if (context.currentPhase === 'break' && context.situation !== 'tight-schedule') {
    score -= 80
  }

  if (['start', 'focus', 'closing'].includes(slotRole)) {
    score += 18
  }

  if (slotRole === 'movement') {
    score -= 36
  }

  if (recommendation.durationMinutes <= 0.67 && context.situation !== 'tight-schedule') {
    score -= 18
  }

  if (countMiniResets(schedule) >= 1) {
    score -= context.situation === 'tight-schedule' ? 42 : 120
  }

  return score
}

function exceedsSoftDiversityLimit(recommendation, schedule) {
  const mainBodyArea = recommendation.bodyArea[0]

  return (
    countMatchingMovementType(schedule, recommendation.movementType) >= 2 ||
    (
      mainBodyArea &&
      schedule.filter((item) => item.bodyArea?.includes(mainBodyArea)).length >= 2
    ) ||
    (
      recommendation.visibilityLevel === 'visible' &&
      schedule.filter((item) => item.visibilityLevel === 'visible').length >= 2
    ) ||
    (
      usesSpecialSetup(recommendation) &&
      countSpecialSetupRecommendations(schedule) >= 2
    )
  )
}

function getReplacementReasonScore(recommendation, reason, originalSection, context) {
  let score = 0

  if (reason === 'meeting') {
    score += recommendation.visibilityLevel === 'discreet' ? 90 : 0
    score += recommendation.visibilityLevel === 'normal' ? 10 : 0
    score += recommendation.visibilityLevel === 'visible' ? -130 : 0
    score += ['breathing', 'sit_reset', 'mobilize'].includes(
      recommendation.movementType,
    )
      ? 55
      : 0
    score += ['walk', 'activate'].includes(recommendation.movementType) ? -45 : 0
    score += recommendation.intensity === 'active' ? -35 : 0
    score += isMiniReset(recommendation) ? 55 : 0
  }

  if (reason === 'focus-work') {
    score += recommendation.durationMinutes <= 2 ? 95 : 0
    score += recommendation.durationMinutes === 3 ? 35 : 0
    score += recommendation.durationMinutes > 5 ? -120 : 0
    score += ['breathing', 'sit_reset', 'mobilize'].includes(
      recommendation.movementType,
    )
      ? 70
      : 0
    score += recommendation.bodyArea.includes('eyes') ? 70 : 0
    score += countBodyAreaOverlap(recommendation.bodyArea, [
      'neck',
      'shoulders',
      'upper-back',
    ]) * 28
    score += recommendation.visibilityLevel === 'discreet' ? 40 : 0
    score += recommendation.visibilityLevel === 'visible' ? -80 : 0
    score += isMiniReset(recommendation) ? 85 : 0
  }

  if (reason === 'phone') {
    score += ['walk', 'walking_meeting'].includes(recommendation.movementType)
      ? 125
      : 0
    score += ['stand', 'mobilize'].includes(recommendation.movementType) ? 42 : 0
    score += recommendation.position === 'walking' ? 65 : 0
    score += recommendation.bodyArea.includes('eyes') ? -36 : 0
    score += recommendation.position === 'sitting' ? -18 : 0
  }

  if (reason === 'between-tasks') {
    score += ['stand', 'walk', 'mobilize', 'sit_reset'].includes(
      recommendation.movementType,
    )
      ? 58
      : 0
    score += recommendation.durationMinutes <= 3 ? 34 : 0
    score += recommendation.visibilityLevel === 'visible' ? -18 : 0
    score += isMiniReset(recommendation) ? 26 : 0
  }

  if (reason === 'calmer') {
    score += recommendation.intensity === 'gentle' ? 95 : 0
    score += recommendation.intensity === 'active' ? -95 : 0
    score += ['breathing', 'sit_reset', 'mobilize'].includes(
      recommendation.movementType,
    )
      ? 60
      : 0
    score += ['stairs', 'activate'].includes(recommendation.movementType) ? -55 : 0
    score += recommendation.position === 'stairs' ? -70 : 0
    score += recommendation.visibilityLevel === 'visible' ? -45 : 0
    score += isMiniReset(recommendation) ? -90 : 0
    score += isCalmReplacement(recommendation) ? 80 : -60
  }

  if (isTimeReplacementReason(reason)) {
    score += recommendation.durationMinutes <= 1 ? 180 : 0
    score += recommendation.durationMinutes === 2 ? 120 : 0
    score += recommendation.durationMinutes === 3 ? 45 : 0
    score += recommendation.durationMinutes > 5 ? -130 : 0
    score -= recommendation.durationMinutes * 12
    score += hasNoSpecialSetup(recommendation.requiredSetup) ? 45 : -35
    score += recommendation.visibilityLevel === 'discreet' ? 24 : 0
    score += isMiniReset(recommendation) ? 120 : 0
    score += isMeaningfullyShorterReplacement(recommendation, originalSection) ? 120 : 0
    score += isShorterReplacement(recommendation, originalSection) ? 80 : -160
  }

  if (reason === 'too-visible') {
    score += recommendation.visibilityLevel === 'discreet' ? 110 : 0
    score += recommendation.visibilityLevel === 'normal' ? 15 : 0
    score += recommendation.visibilityLevel === 'visible' ? -130 : 0
    score +=
      context.currentWorkplace === 'office' &&
      recommendation.visibilityLevel === 'discreet'
        ? 30
        : 0
    score += isMiniReset(recommendation) ? 65 : 0
    score += hasLowerVisibility(recommendation, originalSection) ? 90 : -70
  }

  if (reason === 'no-space') {
    score += hasNoSpecialSetup(recommendation.requiredSetup) ? 110 : -95
    score += ['sitting', 'standing', 'mixed', 'desk'].includes(
      recommendation.position,
    )
      ? 58
      : 0
    score += ['walking', 'stairs', 'floor'].includes(recommendation.position)
      ? -120
      : 0
    score += ['walk', 'walking_meeting', 'activate'].includes(
      recommendation.movementType,
    )
      ? -55
      : 0
    score += isMiniReset(recommendation) ? 70 : 0
    score += isSpaceSavingReplacement(recommendation) ? 70 : -45
  }

  if (reason === 'too-hard') {
    score += recommendation.intensity === 'gentle' ? 100 : 0
    score += recommendation.intensity === 'balanced' ? 15 : 0
    score += recommendation.intensity === 'active' ? -120 : 0
    score += recommendation.position === 'stairs' ? -80 : 0
    score += recommendation.movementType === 'activate' ? -55 : 0
    score += isEasierReplacement(recommendation, originalSection) ? 80 : -45
  }

  if (reason === 'setup-mismatch') {
    score += hasNoSpecialSetup(recommendation.requiredSetup) ? 130 : -110
  }

  if (reason === 'tired') {
    score += ['walk', 'stand', 'activate'].includes(recommendation.movementType)
      ? 88
      : 0
    score += recommendation.durationMinutes <= 4 ? 28 : -24
    score += recommendation.intensity === 'active' ? 26 : 0
    score += recommendation.intensity === 'gentle' ? 10 : 0
    score += recommendation.position === 'walking' ? 54 : 0
    score += isMiniReset(recommendation) ? 48 : 0
  }

  if (reason === 'neck-shoulder') {
    score += countBodyAreaOverlap(recommendation.bodyArea, [
      'neck',
      'shoulders',
      'upper-back',
    ]) * 80
    score += ['mobilize', 'sit_reset', 'stretch', 'breathing'].includes(
      recommendation.movementType,
    )
      ? 35
      : 0
  }

  if (reason === 'back') {
    score += countBodyAreaOverlap(recommendation.bodyArea, [
      'back',
      'spine',
      'hips',
      'lower-back',
      'upper-back',
    ]) * 80
    score += ['mobilize', 'sit_reset', 'stretch'].includes(
      recommendation.movementType,
    )
      ? 38
      : 0
  }

  if (reason === 'walk') {
    score += ['walk', 'walking_meeting'].includes(recommendation.movementType)
      ? 170
      : 0
    score += recommendation.position === 'walking' ? 80 : 0
    score += recommendation.durationMinutes <= 5 ? 26 : -20
    score += isMiniReset(recommendation) && recommendation.position === 'walking' ? 65 : 0
    score += isQuietReset(recommendation) ? -240 : 0
    score += isMovementOrientedReplacement(recommendation) ? 80 : -80
  }

  if (reason === 'not-appealing') {
    score +=
      recommendation.similarityGroup === originalSection.similarityGroup ? -120 : 35
    score += recommendation.movementType === originalSection.movementType ? -70 : 30
    score -= countBodyAreaOverlap(recommendation.bodyArea, originalSection.bodyArea) * 35
  }

  return score
}

function getSlotSpecificReplacementScore(recommendation, slotDefinition, reason) {
  if (slotDefinition?.slotId !== 'lunch_transition') {
    return 0
  }

  let score = 0

  if (isTinyMiniReset(recommendation)) {
    score -= 180
  }

  if (['walk', 'stand', 'activate'].includes(recommendation.movementType)) {
    score += 60
  }

  if (reason === 'walk' && recommendation.position === 'walking') {
    score += 45
  }

  return score
}

function getReplacementDiversityScore(recommendation, originalSection) {
  let score = 0

  if (recommendation.similarityGroup !== originalSection.similarityGroup) {
    score += 28
  }

  if (recommendation.movementType !== originalSection.movementType) {
    score += 18
  }

  score -= countBodyAreaOverlap(recommendation.bodyArea, originalSection.bodyArea) * 8

  return score
}

function formatDuration(durationMinutes) {
  if (durationMinutes < 1 || !Number.isInteger(durationMinutes)) {
    return `${Math.round(durationMinutes * 60)} Sekunden`
  }

  return `${durationMinutes} ${durationMinutes === 1 ? 'Minute' : 'Minuten'}`
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now())

  return Number.isNaN(date.getTime()) ? new Date() : date
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? '')) {
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

function getSlotRoleFromSlotId(slotId) {
  return defaultDaySlotWindows.find((slotDefinition) => slotDefinition.slotId === slotId)
    ?.slotRole
}

function preferredIntensity(fitnessLevel) {
  if (fitnessLevel === 'active') {
    return 'active'
  }

  if (fitnessLevel === 'gentle') {
    return 'gentle'
  }

  return 'balanced'
}

function isIntense(intensity) {
  return intensity === 'active' || intensity === 'Hoch'
}

function normalizeWorkPhase(workPhase) {
  return workPhaseOptions.some((option) => option.id === workPhase)
    ? workPhase
    : 'between-tasks'
}
