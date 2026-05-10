import { movementRules } from '../data/movementRules.js'

const fallbackSetups = ['Kein Equipment', 'Kein spezielles Equipment']
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

const beginnerLevels = ['Level 1', 'Level 2']
const activeLevels = ['Level 3', 'Level 4', 'Level 5']
const intenseValues = ['Mittel', 'Hoch']

const goalAliases = {
  'Bessere Haltung': 'gegen Verspannungen',
  'Bessere Konzentration': 'mehr Energie',
  'Mehr Bewegung im Arbeitsalltag': 'mehr Bewegung',
  'Weniger Rückenschmerzen': 'gegen Verspannungen',
}

const fitnessLevelAliases = {
  Aktiv: 'Level 3',
  Einsteiger: 'Level 2',
  Fortgeschritten: 'Level 3',
}

const setupAliases = {
  'Höhenverstellbarer Schreibtisch': 'Stehschreibtisch',
}

const situationAliases = {
  Fokustag: ['Fokusarbeit', 'Deep Work', 'Lernen'],
  Meetingtag: ['Meeting', 'Meeting Kamera an', 'Meeting Kamera aus', 'Telefonat'],
  'Mixed Day': ['Fokusarbeit', 'Meeting', 'Kreativarbeit', 'Pause', 'Telefonat'],
}

export function generatePlan(answers) {
  const context = normalizeContext(answers)
  const recommendationCount = getRecommendationCount(context.fitnessLevel)
  const matchingRules = getMatchingRules(context)
  const fallbackRules = getFallbackRules(context)
  const candidateRules = uniqueRules([...matchingRules, ...fallbackRules])
  const sortedRules = sortRulesByRelevance(candidateRules, context)

  const recommendations = ensureMinimumRecommendations(
    avoidBadSequences(sortedRules, recommendationCount),
    sortedRules,
    context,
    recommendationCount,
  )

  const dailySchedule = buildDailySchedule(sortedRules, context)

  return {
    dailySchedule,
    summary: `Du möchtest ${context.goal || 'mehr Bewegung'} und nutzt ${formatList(
      context.setup,
    )}. Für ${context.situation || 'deinen Arbeitstag'} bleibt der Plan bewusst kurz, damit Bewegung realistisch wird.`,
    rhythm: buildRhythm(context),
    movements: recommendations.map(toMovementCardData),
  }
}

function normalizeContext(answers) {
  const rawSetup = answers.setup ?? []

  return {
    fitnessLevel: fitnessLevelAliases[answers.fitnessLevel] ?? answers.fitnessLevel,
    goal: goalAliases[answers.goal] ?? answers.goal,
    originalGoal: answers.goal,
    setup: uniqueValues([
      ...rawSetup,
      ...rawSetup.map((setup) => setupAliases[setup]).filter(Boolean),
    ]),
    situation: answers.situation,
    situationMatches: situationAliases[answers.situation] ?? [answers.situation],
  }
}

function getMatchingRules(context) {
  return movementRules.filter(
    (rule) =>
      hasAnySetup(rule, context.setup) &&
      matchesGoal(rule, context.goal) &&
      matchesFitnessLevel(rule, context.fitnessLevel),
  )
}

function getFallbackRules(context) {
  const goalBasedFallbacks = movementRules.filter(
    (rule) =>
      hasAnySetup(rule, fallbackSetups) &&
      matchesGoal(rule, context.goal) &&
      matchesFitnessLevel(rule, context.fitnessLevel),
  )

  const broadFallbacks = movementRules.filter(
    (rule) =>
      hasAnySetup(rule, fallbackSetups) &&
      matchesFitnessLevel(rule, context.fitnessLevel),
  )

  return uniqueRules([...goalBasedFallbacks, ...broadFallbacks])
}

function sortRulesByRelevance(rules, context) {
  return [...rules].sort(
    (firstRule, secondRule) =>
      scoreRule(secondRule, context) - scoreRule(firstRule, context),
  )
}

function scoreRule(rule, context) {
  let score = rule.priority

  if (matchesSituation(rule, context.situationMatches)) {
    score += 35
  }

  if (matchesGoal(rule, context.goal)) {
    score += 20
  }

  if (prefersMobility(context) && ['mobility', 'posture'].includes(rule.type)) {
    score += 24
  }

  if (prefersFocus(context) && ['walking', 'mobility'].includes(rule.type)) {
    score += 18
  }

  if (context.situation === 'Meetingtag' && ['walking', 'standing', 'posture'].includes(rule.type)) {
    score += 12
  }

  if (context.situation === 'Mixed Day' && ['mobility', 'posture', 'walking'].includes(rule.type)) {
    score += 18
  }

  if (beginnerLevels.includes(context.fitnessLevel) && rule.intensity === 'Leicht') {
    score += 16
  }

  if (activeLevels.includes(context.fitnessLevel) && ['Mittel', 'Hoch'].includes(rule.intensity)) {
    score += 8
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
  if (beginnerLevels.includes(context.fitnessLevel)) {
    return 5
  }

  return context.situation === 'Mixed Day' ? 7 : 6
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

  if (timeLabel.includes('Vormittag') && prefersFocus(context)) {
    score += ['walking', 'mobility'].includes(rule.type) ? 14 : 0
  }

  if (timeLabel === 'Mittagspause' && ['walking', 'stairs', 'cycling', 'strength'].includes(rule.type)) {
    score += 18
  }

  if (timeLabel === 'Früher Nachmittag' && ['walking', 'mobility'].includes(rule.type)) {
    score += 12
  }

  if (timeLabel === 'Nachmittag' && context.situation === 'Mixed Day') {
    score += ['mobility', 'posture'].includes(rule.type) ? 16 : 0
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
      context.situation === 'Meetingtag' &&
      candidate.type === 'walking' &&
      currentSchedule.some((section) => section.movementType === 'walking')
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
    .filter((rule) => matchesFitnessLevel(rule, context.fitnessLevel))
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

function isIntense(intensity) {
  return intenseValues.includes(intensity)
}

function isLongStanding(type, duration) {
  return type === 'standing' && getLongestDuration(duration) >= 10
}

function getLongestDuration(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  return numbers.length ? Math.max(...numbers) : 0
}

function hasAnySetup(rule, selectedSetup) {
  if (!selectedSetup.length) {
    return false
  }

  return rule.setup.some((setup) => selectedSetup.includes(setup))
}

function matchesGoal(rule, selectedGoal) {
  return !selectedGoal || rule.goals.includes(selectedGoal)
}

function matchesFitnessLevel(rule, selectedFitnessLevel) {
  return !selectedFitnessLevel || rule.fitnessLevels.includes(selectedFitnessLevel)
}

function matchesSituation(rule, selectedSituations) {
  const situations = Array.isArray(selectedSituations)
    ? selectedSituations
    : [selectedSituations]

  return !situations[0] || situations.some((situation) => rule.situations.includes(situation))
}

function prefersMobility(context) {
  return ['gegen Verspannungen', 'Weniger Rückenschmerzen', 'Bessere Haltung'].includes(
    context.originalGoal ?? context.goal,
  )
}

function prefersFocus(context) {
  return context.originalGoal === 'Bessere Konzentration' || context.situation === 'Fokustag'
}

function getRecommendationCount(fitnessLevel) {
  return beginnerLevels.includes(fitnessLevel)
    ? minimumRecommendations
    : maximumRecommendations
}

function uniqueRules(rules) {
  return rules.filter(
    (rule, index, list) => rule && list.findIndex((item) => item.id === rule.id) === index,
  )
}

function uniqueValues(values) {
  return [...new Set(values)]
}

function toMovementCardData(rule) {
  return {
    description: rule.description,
    displaySetup: formatSetup(rule.setup),
    duration: rule.duration,
    id: rule.id,
    intensity: rule.intensity,
    setup: rule.setup,
    title: rule.title,
    type: rule.type,
  }
}

function toScheduleSection(rule, timeLabel, index, context) {
  return {
    description: rule.description,
    duration: rule.duration,
    id: `${timeLabel.toLowerCase().replaceAll(' ', '-')}-${rule.id}`,
    intensity: rule.intensity,
    movementType: rule.type,
    reason: getReason(rule, timeLabel, context),
    ruleId: rule.id,
    setup: formatSetup(rule.setup),
    timeLabel,
    title: rule.title,
  }
}

function getReason(rule, timeLabel, context) {
  if (context.situation === 'Mixed Day') {
    return 'Der Impuls bringt Wechsel in einen abwechslungsreichen Tag, ohne eine Belastung zu lange am Stück zu halten.'
  }

  if (matchesSituation(rule, context.situationMatches)) {
    return `Passt gut zu ${context.situation}, weil Dauer und Intensität in diesen Arbeitsabschnitt passen.`
  }

  if (prefersMobility(context) && ['mobility', 'posture'].includes(rule.type)) {
    return 'Mobilisation und Haltungswechsel entlasten Rücken, Nacken und Schultern besonders gut.'
  }

  if (timeLabel === 'Mittagspause') {
    return 'In der Pause darf der Impuls etwas aktiver sein, bevor du wieder in ruhigere Arbeit wechselst.'
  }

  return 'Die Empfehlung ergänzt dein Setup und hält den Tagesrhythmus abwechslungsreich.'
}

function formatSetup(setups) {
  const visibleSetups = setups.filter((setup) => setup !== 'Kein spezielles Equipment')
  return visibleSetups.length ? visibleSetups.join(', ') : 'Kein Equipment'
}

function buildRhythm(context) {
  if (context.situation === 'Mixed Day') {
    return 'Plane über den Tag mehrere kurze Wechsel ein: mobilisieren, leicht gehen, sitzen, kurz aktivieren und am Ende wieder entlasten.'
  }

  if (context.setup.includes('Walking Pad')) {
    return 'Starte ruhig, nutze maximal eine Walking-Phase für Meeting oder Fokusarbeit und wechsle danach bewusst zurück zu Sitz- oder Mobilisationsimpulsen.'
  }

  if (context.setup.includes('Stehschreibtisch')) {
    return 'Wechsle alle 45 bis 60 Minuten zwischen Sitzen und Stehen. Nach längeren Stehphasen folgt bewusst wieder eine Sitz- oder Mobilisationsphase.'
  }

  if (beginnerLevels.includes(context.fitnessLevel)) {
    return 'Plane alle 60 bis 90 Minuten einen sehr kurzen Bewegungsimpuls. Zwei bis drei Minuten reichen für den Start vollkommen aus.'
  }

  return 'Arbeite in Fokusblöcken von 45 bis 60 Minuten und setze danach kurze aktive Pausen, die Mobilität, Kreislauf und Haltung abwechseln.'
}

function formatList(items) {
  if (!items?.length) {
    return 'kein spezielles Setup'
  }

  if (items.length === 1) {
    return items[0]
  }

  return `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`
}
