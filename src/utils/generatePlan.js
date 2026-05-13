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
  start: { breathing: 14, mobilize: 18, sit_reset: 12, stand: 8 },
  focus: { breathing: 16, eyes: 18, mobilize: 18, sit_reset: 14 },
  movement: { activate: 18, stand: 10, walk: 22, walking_meeting: 16 },
  relief: { mobilize: 20, relax: 16, sit_reset: 18, stretch: 18 },
  closing: { breathing: 12, mobilize: 16, relax: 22, sit_reset: 14 },
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
  const matching = movementRecommendations.filter((recommendation) =>
    isRecommendationAvailable(recommendation, context),
  )

  if (matching.length >= minimumRecommendations) {
    return matching
  }

  return movementRecommendations.filter(
    (recommendation) =>
      hasNoSpecialSetup(recommendation.requiredSetup) &&
      recommendation.suitableWorkplaces.includes(context.currentWorkplace) &&
      allowedIntensities.gentle.includes(recommendation.intensity),
  )
}

function isRecommendationAvailable(recommendation, context) {
  return (
    recommendation.suitableWorkplaces.includes(context.currentWorkplace) &&
    hasRequiredSetup(recommendation.requiredSetup, context.setup) &&
    allowedIntensities[context.fitnessLevel]?.includes(recommendation.intensity)
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

  if (context.currentWorkplace === 'office' && context.currentPhase !== 'break') {
    score += getOfficeVisibilityScore(recommendation.visibilityLevel)
  }

  score -= schedulePenalty(recommendation, schedule)

  return score
}

function schedulePenalty(recommendation, schedule) {
  const last = schedule.at(-1)
  let penalty = 0

  if (last?.movementType === recommendation.movementType) {
    penalty += 80
  }

  if (last?.movementType === 'stand' && recommendation.movementType === 'stand') {
    penalty += 100
  }

  if (schedule.some((item) => item.id === recommendation.id)) {
    penalty += 120
  }

  if (schedule.some((item) => item.similarityGroup === recommendation.similarityGroup)) {
    penalty += 34
  }

  if (
    last?.position &&
    recommendation.position &&
    last.position === recommendation.position &&
    recommendation.position !== 'mixed'
  ) {
    penalty += 18
  }

  const lastBodyAreaOverlap = countBodyAreaOverlap(last?.bodyArea, recommendation.bodyArea)
  penalty += lastBodyAreaOverlap * 8

  penalty += schedule.filter((item) =>
    countBodyAreaOverlap(item.bodyArea, recommendation.bodyArea) > 0,
  ).length * 4

  penalty += schedule.filter(
    (item) => item.movementType === recommendation.movementType,
  ).length * 14

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
      pickNextRecommendation(sortedRecommendations, schedule, context, slotRole, true)

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
  allowSimilarity = false,
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

    return canFollow(currentSchedule.at(-1), candidate)
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

function getScheduleLength(context) {
  if (context.fitnessLevel === 'gentle') {
    return 5
  }

  if (context.fitnessLevel === 'active' || context.situation === 'mixed-day') {
    return 7
  }

  return 6
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
    explanation: recommendation.explanation,
    id: `${timeLabel.toLowerCase().replaceAll(' ', '-')}-${recommendation.id}`,
    instructionSteps: recommendation.instructionSteps,
    intensity: intensityLabels[recommendation.intensity],
    movementType: recommendation.movementType,
    position: recommendation.position,
    reason: buildReason(recommendation, context),
    ruleId: recommendation.id,
    ruleType: movementTypeLegacyTypes[recommendation.movementType],
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

function getMeetingVisibilityScore(visibilityLevel) {
  if (visibilityLevel === 'discreet') {
    return 18
  }

  if (visibilityLevel === 'normal') {
    return 6
  }

  if (visibilityLevel === 'visible') {
    return -22
  }

  return 0
}

function getOfficeVisibilityScore(visibilityLevel) {
  if (visibilityLevel === 'discreet') {
    return 4
  }

  if (visibilityLevel === 'visible') {
    return -10
  }

  return 0
}

function countBodyAreaOverlap(firstBodyArea = [], secondBodyArea = []) {
  return firstBodyArea.filter((bodyArea) => secondBodyArea.includes(bodyArea)).length
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
