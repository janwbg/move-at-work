import { movementRules } from '../data/movementRules.js'
import {
  deriveWorkPhaseFromWorkday,
  getOptionLabel,
  goalOptions,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  workdayOptions,
  workPhaseOptions,
} from '../data/profileOptions.js'

const minimumRecommendations = 3
const maximumRecommendations = 5

const fallbackSetups = [
  'BÃ¼rostuhl',
  'Buerostuhl',
  'Bürostuhl',
  'Sitzschreibtisch',
  'Kein Equipment',
  'Kein spezielles Equipment',
]

const setupRuleMap = {
  'no-equipment': fallbackSetups,
  'standing-desk': [
    'Stehschreibtisch',
    'Hoehenverstellbarer Schreibtisch',
    'HÃ¶henverstellbarer Schreibtisch',
    'Höhenverstellbarer Schreibtisch',
  ],
  'walking-pad': ['Walking Pad'],
  'exercise-space': ['Boden', ...fallbackSetups],
  'small-equipment': ['Balance Board', 'Gymnastikball'],
  'stairs-hallway': ['Treppenstufen', 'Kein Equipment', 'Kein spezielles Equipment'],
  'ergonomic-support': ['Kniestuhl', 'Stehhocker', 'Sofa/Lounge'],
}

const daySlots = [
  'Start in den Arbeitstag',
  'Vormittag',
  'Spaeter Vormittag',
  'Mittagspause',
  'Frueher Nachmittag',
  'Nachmittag',
  'Abschluss des Arbeitstages',
]

const phaseSituations = {
  break: ['Pause'],
  'between-tasks': ['Warten (zwischen Terminen)', 'Kreativarbeit', 'Brainstorming'],
  focus: ['Fokusarbeit', 'Deep Work', 'E-Mails', 'Lesen', 'Lernen'],
  meeting: ['Meeting', 'Meeting Kamera an', 'Meeting Kamera aus'],
  phone: ['Telefonat'],
}

const workdaySituationMap = {
  'focus-heavy': ['Fokusarbeit', 'Deep Work', 'E-Mails', 'Lesen', 'Lernen'],
  'meeting-heavy': ['Meeting', 'Meeting Kamera an', 'Meeting Kamera aus', 'Telefonat'],
  'mixed-day': [
    'Fokusarbeit',
    'Meeting',
    'Kreativarbeit',
    'Pause',
    'Telefonat',
    'Warten (zwischen Terminen)',
  ],
}

const goalTypeScores = {
  'back-neck': { mobility: 34, posture: 30, standing: 10 },
  focus: { mobility: 24, posture: 22, standing: 12, walking: 6 },
  habit: { mobility: 18, posture: 18, standing: 16, walking: 14 },
  'more-energy': { walking: 34, stairs: 28, cycling: 20, standing: 18, mobility: 10 },
  'sit-less': { standing: 32, walking: 26, posture: 18, mobility: 12 },
}

const workdayTypeScores = {
  'focus-heavy': { mobility: 20, posture: 18, standing: 12 },
  'meeting-heavy': { standing: 22, walking: 20, posture: 14 },
  'mixed-day': { mobility: 14, walking: 14, posture: 12, standing: 12 },
}

const phaseTypeScores = {
  break: { walking: 28, stairs: 22, mobility: 16, strength: 12 },
  'between-tasks': { mobility: 24, posture: 20, standing: 18, walking: 14 },
  focus: { mobility: 26, posture: 22, standing: 12 },
  meeting: { standing: 26, posture: 20, walking: 14 },
  phone: { walking: 30, standing: 18, mobility: 10 },
}

const intensityScores = {
  active: { Hoch: 20, Leicht: 4, Mittel: 18 },
  balanced: { Hoch: -12, Leicht: 14, Mittel: 16 },
  gentle: { Hoch: -80, Leicht: 28, Mittel: -20 },
}

const allowedIntensities = {
  active: ['Leicht', 'Mittel', 'Hoch'],
  balanced: ['Leicht', 'Mittel'],
  gentle: ['Leicht'],
}

export function generatePlan(answers) {
  const context = normalizeContext(answers)
  const recommendationCount = getRecommendationCount(context)
  const matchingRules = getMatchingRules(context)
  const sortedRules = sortRulesByRelevance(matchingRules, context)
  const recommendations = ensureMinimumRecommendations(
    avoidBadSequences(sortedRules, recommendationCount),
    sortedRules,
    context,
    recommendationCount,
  )
  const dailySchedule = buildDailySchedule(sortedRules, context)

  return {
    dailySchedule,
    summary: buildSummary(context),
    rhythm: buildRhythm(context),
    movements: recommendations.map((rule) => toMovementCardData(rule, context)),
  }
}

function normalizeContext(answers) {
  const profile = normalizeProfileAnswers(answers)
  const currentPhase = normalizeWorkPhase(
    answers?.currentPhase ?? deriveWorkPhaseFromWorkday(profile.situation),
  )

  return {
    ...profile,
    currentPhase,
    allowedRuleSetups: getAllowedRuleSetups(profile.setup),
    phaseSituations: phaseSituations[currentPhase] ?? phaseSituations['between-tasks'],
    workdaySituations: workdaySituationMap[profile.situation] ?? workdaySituationMap['mixed-day'],
  }
}

function getAllowedRuleSetups(selectedSetup) {
  return [
    ...new Set([
      ...fallbackSetups,
      ...selectedSetup.flatMap((setup) => setupRuleMap[setup] ?? []),
    ]),
  ]
}

function getMatchingRules(context) {
  const directMatches = movementRules.filter(
    (rule) =>
      hasAnySetup(rule, context.allowedRuleSetups) &&
      matchesIntensity(rule, context.fitnessLevel),
  )

  if (directMatches.length >= minimumRecommendations) {
    return directMatches
  }

  return movementRules.filter(
    (rule) => hasAnySetup(rule, fallbackSetups) && rule.intensity === 'Leicht',
  )
}

function sortRulesByRelevance(rules, context) {
  return [...rules].sort(
    (firstRule, secondRule) =>
      scoreRule(secondRule, context) - scoreRule(firstRule, context),
  )
}

function scoreRule(rule, context) {
  let score = rule.priority

  score += goalTypeScores[context.goal]?.[rule.type] ?? 0
  score += workdayTypeScores[context.situation]?.[rule.type] ?? 0
  score += phaseTypeScores[context.currentPhase]?.[rule.type] ?? 0
  score += intensityScores[context.fitnessLevel]?.[rule.intensity] ?? 0

  if (matchesAnySituation(rule, context.phaseSituations)) {
    score += 28
  }

  if (matchesAnySituation(rule, context.workdaySituations)) {
    score += 12
  }

  if (context.currentPhase === 'meeting' && rule.type === 'walking') {
    score += context.setup.includes('walking-pad') ? 16 : -18
  }

  if (context.currentPhase === 'focus' && ['stairs', 'cycling', 'strength'].includes(rule.type)) {
    score -= 34
  }

  if (context.goal === 'focus' && getLongestDuration(rule.duration) > 5) {
    score -= 24
  }

  if (context.goal === 'habit' && rule.intensity === 'Leicht') {
    score += 12
  }

  return score
}

function buildDailySchedule(sortedRules, context) {
  const scheduleLength = getScheduleLength(context)
  const slotLabels = getTimeLabels(scheduleLength)
  const slotCandidates = slotLabels.map((timeLabel) =>
    sortRulesBySlot(sortedRules, timeLabel, context),
  )
  const schedule = []

  for (const [index, timeLabel] of slotLabels.entries()) {
    const candidates = slotCandidates[index]
    const nextRule =
      pickNextRule(candidates, schedule, context) ??
      pickNextRule(candidates, schedule, context, true)

    if (!nextRule) {
      continue
    }

    schedule.push(toScheduleSection(nextRule, timeLabel, index, context))
  }

  return schedule
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
      'Spaeter Vormittag',
      'Mittagspause',
      'Frueher Nachmittag',
      'Abschluss des Arbeitstages',
    ]
  }

  return daySlots
}

function sortRulesBySlot(rules, timeLabel, context) {
  return [...rules].sort(
    (firstRule, secondRule) =>
      scoreRuleForSlot(secondRule, timeLabel, context) -
      scoreRuleForSlot(firstRule, timeLabel, context),
  )
}

function scoreRuleForSlot(rule, timeLabel, context) {
  let score = scoreRule(rule, context)

  if (timeLabel === 'Start in den Arbeitstag' && ['mobility', 'posture'].includes(rule.type)) {
    score += 18
  }

  if (timeLabel === 'Start in den Arbeitstag' && ['strength', 'stairs', 'cycling'].includes(rule.type)) {
    score -= 48
  }

  if (timeLabel.includes('Vormittag') && context.currentPhase === 'focus') {
    score += ['mobility', 'posture'].includes(rule.type) ? 16 : 0
  }

  if (timeLabel === 'Mittagspause' && ['walking', 'stairs', 'cycling', 'strength'].includes(rule.type)) {
    score += context.fitnessLevel === 'gentle' ? 0 : 18
  }

  if (timeLabel === 'Frueher Nachmittag' && ['walking', 'mobility'].includes(rule.type)) {
    score += 12
  }

  if (timeLabel === 'Nachmittag' && context.situation === 'mixed-day') {
    score += ['mobility', 'posture', 'walking'].includes(rule.type) ? 16 : 0
  }

  if (timeLabel === 'Abschluss des Arbeitstages' && ['mobility', 'posture'].includes(rule.type)) {
    score += 20
  }

  if (timeLabel === 'Abschluss des Arbeitstages' && ['strength', 'stairs', 'cycling'].includes(rule.type)) {
    score -= 56
  }

  return score
}

function pickNextRule(candidates, currentSchedule, context, allowReuse = false) {
  return candidates.find((candidate) => {
    const previousSection = currentSchedule.at(-1)

    if (!allowReuse && currentSchedule.some((section) => section.ruleId === candidate.id)) {
      return false
    }

    if (!canFollow(previousSection, candidate)) {
      return false
    }

    if (
      context.currentPhase === 'meeting' &&
      candidate.type === 'walking' &&
      !context.setup.includes('walking-pad')
    ) {
      return false
    }

    return true
  })
}

function avoidBadSequences(rules, recommendationCount) {
  const plan = []
  const candidates = [...rules]

  while (plan.length < recommendationCount && candidates.length) {
    const nextIndex = candidates.findIndex((candidate) =>
      canFollow(plan.at(-1), candidate),
    )

    if (nextIndex === -1) {
      break
    }

    const [nextRule] = candidates.splice(nextIndex, 1)
    plan.push(nextRule)
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

  const lastResortRules = movementRules
    .filter((rule) => hasAnySetup(rule, fallbackSetups))
    .filter((rule) => matchesIntensity(rule, context.fitnessLevel))
    .filter(
      (rule) =>
        !existingCandidates.some((candidate) => candidate.id === rule.id) &&
        !recommendations.some((recommendation) => recommendation.id === rule.id),
    )

  return avoidBadSequences(
    [...recommendations, ...sortRulesByRelevance(lastResortRules, context)],
    recommendationCount,
  )
}

function canFollow(previousItem, nextRule) {
  if (!previousItem) {
    return true
  }

  const previousType = previousItem.type ?? previousItem.movementType
  const previousIntensity = previousItem.intensity
  const previousDuration = previousItem.duration

  if (previousType === nextRule.type) {
    return false
  }

  if (nextRule.avoidAfterTypes.includes(previousType)) {
    return false
  }

  if (previousItem.avoidAfterTypes?.includes(nextRule.type)) {
    return false
  }

  if (isIntense(previousIntensity) && isIntense(nextRule.intensity)) {
    return false
  }

  if (isLongStanding(previousType, previousDuration) && isLongStanding(nextRule.type, nextRule.duration)) {
    return false
  }

  if (previousType === 'walking' && ['cycling', 'stairs'].includes(nextRule.type)) {
    return false
  }

  return true
}

function hasAnySetup(rule, selectedSetup) {
  return rule.setup.some((setup) => selectedSetup.includes(setup))
}

function matchesIntensity(rule, selectedIntensity) {
  return allowedIntensities[selectedIntensity]?.includes(rule.intensity) ?? true
}

function matchesAnySituation(rule, situations) {
  return situations.some((situation) => rule.situations.includes(situation))
}

function isIntense(intensity) {
  return ['Mittel', 'Hoch'].includes(intensity)
}

function isLongStanding(type, duration) {
  return type === 'standing' && getLongestDuration(duration) >= 10
}

function getLongestDuration(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  return numbers.length ? Math.max(...numbers) : 0
}

function getRecommendationCount(context) {
  return context.fitnessLevel === 'gentle'
    ? minimumRecommendations
    : maximumRecommendations
}

function toMovementCardData(rule, context) {
  const compatibleSetups = getCompatibleRuleSetups(rule, context)

  return {
    description: rule.description,
    displaySetup: formatSetup(compatibleSetups),
    duration: rule.duration,
    id: rule.id,
    intensity: rule.intensity,
    setup: compatibleSetups,
    title: rule.title,
    type: rule.type,
  }
}

function toScheduleSection(rule, timeLabel, index, context) {
  const compatibleSetups = getCompatibleRuleSetups(rule, context)

  return {
    description: rule.description,
    duration: rule.duration,
    id: `${timeLabel.toLowerCase().replaceAll(' ', '-')}-${rule.id}`,
    intensity: rule.intensity,
    movementType: rule.type,
    reason: getReason(rule, timeLabel, context),
    ruleId: rule.id,
    setup: formatSetup(compatibleSetups),
    timeLabel,
    title: rule.title,
  }
}

function getCompatibleRuleSetups(rule, context) {
  return rule.setup.filter((setup) => context.allowedRuleSetups.includes(setup))
}

function getReason(rule, timeLabel, context) {
  const phaseLabel = getOptionLabel(workPhaseOptions, context.currentPhase)

  if (matchesAnySituation(rule, context.phaseSituations)) {
    return `Passt gerade zu ${phaseLabel}, weil Dauer und Art der Bewegung gut in diesen Moment passen.`
  }

  if (context.goal === 'back-neck' && ['mobility', 'posture'].includes(rule.type)) {
    return 'Sanfte Mobilisation und Positionswechsel entlasten Schultern, Nacken und Ruecken im Arbeitsalltag.'
  }

  if (context.goal === 'sit-less' && ['standing', 'walking', 'posture'].includes(rule.type)) {
    return 'Der Impuls unterbricht langes Sitzen und bringt einen einfachen Positionswechsel in den Tag.'
  }

  if (context.goal === 'focus' && timeLabel.includes('Vormittag')) {
    return 'Kurz, ruhig und passend fuer konzentrierte Arbeit ohne grossen Bruch.'
  }

  if (timeLabel === 'Mittagspause') {
    return 'In der Pause darf der Impuls etwas aktiver sein, bevor du wieder in ruhigere Arbeit wechselst.'
  }

  return 'Die Empfehlung passt zu deinem Setup und haelt den Tagesrhythmus abwechslungsreich.'
}

function buildRhythm(context) {
  if (context.currentPhase === 'meeting') {
    return 'Fuer Meetings stehen ruhige Positionswechsel im Vordergrund. Walking Pad wird nur genutzt, wenn es in deinem Setup vorhanden ist.'
  }

  if (context.currentPhase === 'phone') {
    return 'Bei Telefonaten eignen sich lockeres Gehen, Stehen oder einfache Mobilisation besonders gut.'
  }

  if (context.situation === 'focus-heavy') {
    return 'Plane kurze, ruhige Microbreaks zwischen Fokusbloecken. Der Plan bleibt bewusst unauffaellig.'
  }

  if (context.situation === 'meeting-heavy') {
    return 'Nutze kleine Resets vor oder nach Terminen und wechsle regelmaessig zwischen Sitzen und Stehen.'
  }

  if (context.setup.includes('standing-desk')) {
    return 'Wechsle regelmaessig zwischen Sitzen und Stehen und kombiniere das mit kurzen Mobilisationsimpulsen.'
  }

  if (context.fitnessLevel === 'gentle') {
    return 'Plane alle 60 bis 90 Minuten einen sehr kurzen Bewegungsimpuls. Zwei bis drei Minuten reichen fuer den Start.'
  }

  return 'Setze ueber den Tag mehrere kurze Wechsel: mobilisieren, leicht gehen, sitzen, kurz aktivieren und wieder entlasten.'
}

function buildSummary(context) {
  const goalLabel = getOptionLabel(goalOptions, context.goal)
  const workdayLabel = getOptionLabel(workdayOptions, context.situation)
  const intensityLabel = getOptionLabel(intensityOptions, context.fitnessLevel)
  const setupLabel = context.setup
    .map((setup) => getOptionLabel(setupOptions, setup))
    .join(', ')

  return `${goalLabel} mit ${intensityLabel.toLowerCase()}en Empfehlungen: dein Plan orientiert sich an ${setupLabel} und ${workdayLabel.toLowerCase()}.`
}

function formatSetup(setups) {
  const labels = setups
    .map((setup) => {
      if (fallbackSetups.includes(setup)) {
        return 'Kein besonderes Equipment'
      }

      if (
        setup.includes('Stehschreibtisch') ||
        setup.includes('Hoehenverstellbarer') ||
        setup.includes('HÃ¶henverstellbarer') ||
        setup.includes('Höhenverstellbarer')
      ) {
        return 'Hoehenverstellbarer Schreibtisch'
      }

      if (setup === 'Treppenstufen') {
        return 'Treppe oder Flur'
      }

      if (['Balance Board', 'Gymnastikball'].includes(setup)) {
        return 'Kleines Bewegungsequipment'
      }

      if (['Kniestuhl', 'Stehhocker', 'Sofa/Lounge'].includes(setup)) {
        return 'Ergonomische Sitz- oder Stehhilfe'
      }

      if (setup === 'Boden') {
        return 'Platz fuer kurze Uebungen'
      }

      return setup
    })
    .filter(Boolean)

  return [...new Set(labels)].join(', ')
}

function normalizeWorkPhase(workPhase) {
  return workPhaseOptions.some((option) => option.id === workPhase)
    ? workPhase
    : 'between-tasks'
}
