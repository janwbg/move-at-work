import { movementRecommendations } from '../data/movementRecommendations.js'
import {
  deriveWorkPhaseFromWorkday,
  getOptionLabel,
  goalOptions,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  workplaceOptions,
  workdayOptions,
  workPhaseOptions,
} from '../data/profileOptions.js'

const minimumRecommendations = 3
const maximumRecommendations = 5

const daySlots = [
  'Start in den Arbeitstag',
  'Vormittag',
  'Später Vormittag',
  'Mittagspause',
  'Früher Nachmittag',
  'Nachmittag',
  'Abschluss des Arbeitstages',
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
  focus: { breathing: 24, eyes: 28, mobilize: 22, sit_reset: 20, walk: 8 },
  meeting: { sit_reset: 24, stand: 20, walking_meeting: 24 },
  phone: { stand: 16, walk: 30, walking_meeting: 28 },
}

const goalMovementTypeScores = {
  'back-neck': { mobilize: 28, sit_reset: 22, stretch: 22 },
  focus: { breathing: 18, eyes: 24, mobilize: 14, sit_reset: 18 },
  habit: { mobilize: 12, sit_reset: 12, stand: 14, walk: 14 },
  'more-energy': { activate: 24, stand: 12, walk: 26, walking_meeting: 18 },
  'sit-less': { sit_reset: 18, stand: 26, walk: 24, walking_meeting: 16 },
}

const slotMovementTypeScores = {
  start: { breathing: 24, mobilize: 22, sit_reset: 22, stand: 8 },
  focus: { breathing: 24, mobilize: 22, sit_reset: 20 },
  movement: { activate: 24, stand: 20, walk: 30, walking_meeting: 24 },
  relief: { mobilize: 24, sit_reset: 14, stretch: 28 },
  closing: { breathing: 26, mobilize: 12, sit_reset: 22, stand: 8 },
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

const relaxedIntensities = {
  active: ['gentle', 'balanced', 'active'],
  balanced: ['gentle', 'balanced', 'active'],
  gentle: ['gentle', 'balanced'],
}

const slotRolesByLength = {
  5: ['start', 'focus', 'movement', 'relief', 'closing'],
  6: ['start', 'focus', 'movement', 'relief', 'movement', 'closing'],
  7: ['start', 'focus', 'movement', 'relief', 'movement', 'focus', 'closing'],
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

function normalizeContext(answers) {
  const profile = normalizeProfileAnswers(answers)
  const currentPhase = normalizeWorkPhase(
    answers?.currentPhase ?? deriveWorkPhaseFromWorkday(profile.situation),
  )
  const requestedWorkplace = answers?.currentWorkplace ?? profile.currentWorkplace
  const currentWorkplace = profile.workplaces.includes(requestedWorkplace)
    ? requestedWorkplace
    : profile.defaultWorkplace
  const setup = profile.workplaceSetups[currentWorkplace] ?? ['no-equipment']

  return {
    ...profile,
    currentPhase,
    currentWorkplace,
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
    recommendation.suitableWorkdayTypes.includes(context.situation)
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

function scoreRecommendation(recommendation, context, schedule = [], slotRole = '') {
  let score = recommendation.priority

  if (recommendation.suitableGoals.includes(context.goal)) {
    score += 34
  }

  if (recommendation.suitablePhases.includes(context.currentPhase)) {
    score += 32
  }

  if (recommendation.suitableWorkdayTypes.includes(context.situation)) {
    score += 18
  }

  if (recommendation.intensity === preferredIntensity(context.fitnessLevel)) {
    score += 14
  }

  score += goalMovementTypeScores[context.goal]?.[recommendation.movementType] ?? 0
  score += phaseMovementTypeScores[context.currentPhase]?.[recommendation.movementType] ?? 0
  score += slotMovementTypeScores[slotRole]?.[recommendation.movementType] ?? 0
  score += getSlotBodyAreaScore(recommendation, slotRole)
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

  score += getPhaseVisibilityScore(recommendation, context)
  score += getWorkplaceVisibilityScore(recommendation, context)
  score += getPositionTransitionScore(recommendation, context, schedule)
  score += getSetupContextScore(recommendation, context, schedule)
  score += getBodyAreaDiversityScore(recommendation, schedule)

  score -= schedulePenalty(recommendation, schedule)

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

function buildDailySchedule(sortedRecommendations, context) {
  const scheduleLength = getScheduleLength(context)
  const slotLabels = getTimeLabels(scheduleLength)
  const slotRoles = slotRolesByLength[scheduleLength] ?? slotRolesByLength[5]
  const schedule = []

  for (const [index, timeLabel] of slotLabels.entries()) {
    const slotRole = slotRoles[index] ?? 'movement'
    const recommendation =
      pickNextRecommendation(sortedRecommendations, schedule, context, slotRole) ??
      pickNextRecommendation(sortedRecommendations, schedule, context, slotRole, {
        allowSimilarity: true,
      }) ??
      pickNextRecommendation(sortedRecommendations, schedule, context, slotRole, {
        allowDiversityFallback: true,
        allowSequenceFallback: true,
        allowSimilarity: true,
      })

    if (!recommendation) {
      continue
    }

    schedule.push(toScheduleSection(recommendation, timeLabel, context))
  }

  return schedule
}

function pickNextRecommendation(
  candidates,
  currentSchedule,
  context,
  slotRole,
  {
    allowDiversityFallback = false,
    allowSequenceFallback = false,
    allowSimilarity = false,
  } = {},
) {
  const sorted = [...candidates].sort(
    (first, second) =>
      scoreRecommendation(second, context, currentSchedule, slotRole) -
      scoreRecommendation(first, context, currentSchedule, slotRole),
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

    return allowSequenceFallback || canFollow(currentSchedule.at(-1), candidate)
  })
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

function getTimeLabels(scheduleLength) {
  if (scheduleLength === 5) {
    return [
      'Start in den Arbeitstag',
      'Vormittag',
      'Mittagspause',
      'Nachmittag',
      'Abschluss des Arbeitstages',
    ]
  }

  if (scheduleLength === 6) {
    return [
      'Start in den Arbeitstag',
      'Vormittag',
      'Später Vormittag',
      'Mittagspause',
      'Früher Nachmittag',
      'Abschluss des Arbeitstages',
    ]
  }

  return daySlots
}

function getRecommendationCount(context) {
  return context.fitnessLevel === 'gentle'
    ? minimumRecommendations
    : maximumRecommendations
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

function toScheduleSection(recommendation, timeLabel, context) {
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
    timeLabel,
    title: recommendation.title,
    visibilityLevel: recommendation.visibilityLevel,
  }
}

function buildReason(recommendation, context) {
  const phaseLabel = getOptionLabel(workPhaseOptions, context.currentPhase)

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
    .map((setup) => getOptionLabel(setupOptions, setup))
    .join(', ')

  return `${goalLabel} mit ${intensityLabel.toLowerCase()}en Empfehlungen: dein Plan orientiert sich an ${setupLabel}, ${workdayLabel.toLowerCase()} und ${workplaceLabel}.`
}

function formatSetup(requiredSetup) {
  if (hasNoSpecialSetup(requiredSetup)) {
    return 'Kein besonderes Equipment'
  }

  return requiredSetup.map((setup) => getOptionLabel(setupOptions, setup)).join(', ')
}

function uniqueRecommendations(recommendations) {
  return [
    ...new Map(
      recommendations.map((recommendation) => [recommendation.id, recommendation]),
    ).values(),
  ]
}

function hasRequiredSetup(requiredSetup, availableSetup) {
  return requiredSetup.every(
    (setup) => setup === 'no-equipment' || availableSetup.includes(setup),
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

function getSlotBodyAreaScore(recommendation, slotRole) {
  return recommendation.bodyArea.reduce(
    (total, bodyArea) => total + (slotBodyAreaScores[slotRole]?.[bodyArea] ?? 0),
    0,
  )
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

function getSetupContextScore(recommendation, context, schedule) {
  const primarySetup = getPrimarySpecialSetup(recommendation.requiredSetup)
  let score = 0

  if (!primarySetup) {
    return score
  }

  if (primarySetup === 'walking-pad') {
    score += ['phone', 'meeting'].includes(context.currentPhase) ? 28 : 8
    score += recommendation.movementType === 'walking_meeting' ? 14 : 0
  }

  if (primarySetup === 'stairs') {
    score += context.currentPhase === 'break' ? 26 : 4
    score += ['balanced', 'active'].includes(recommendation.intensity) ? 10 : 0
  }

  if (primarySetup === 'hallway') {
    score += recommendation.movementType === 'walk' ? 22 : 0
    score += ['phone', 'between-tasks'].includes(context.currentPhase) ? 12 : 0
  }

  if (primarySetup === 'standing-desk') {
    score += ['stand', 'sit_reset'].includes(recommendation.movementType) ? 16 : 6
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

function formatDuration(durationMinutes) {
  return `${durationMinutes} ${durationMinutes === 1 ? 'Minute' : 'Minuten'}`
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
