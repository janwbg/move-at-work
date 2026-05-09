import { movementRules } from '../data/movementRules.js'

const fallbackSetups = ['Kein Equipment', 'Kein spezielles Equipment']
const minimumRecommendations = 3
const maximumRecommendations = 5

export function generatePlan(answers) {
  const selectedSetup = answers.setup ?? []
  const selectedGoal = answers.goal
  const selectedFitnessLevel = answers.fitnessLevel
  const selectedSituation = answers.situation
  const recommendationCount = getRecommendationCount(selectedFitnessLevel)

  const matchingRules = movementRules
    .filter((rule) =>
      matchesRule(rule, {
        selectedFitnessLevel,
        selectedGoal,
        selectedSetup,
      }),
    )
    .sort((firstRule, secondRule) =>
      compareRules(firstRule, secondRule, selectedSituation),
    )

  const goalBasedFallbackRules = movementRules
    .filter((rule) => hasAnySetup(rule, fallbackSetups))
    .filter((rule) => matchesGoal(rule, selectedGoal))
    .filter((rule) => matchesFitnessLevel(rule, selectedFitnessLevel))
    .sort((firstRule, secondRule) =>
      compareRules(firstRule, secondRule, selectedSituation),
    )

  const broadFallbackRules = movementRules
    .filter((rule) => hasAnySetup(rule, fallbackSetups))
    .filter((rule) => matchesFitnessLevel(rule, selectedFitnessLevel))
    .sort((firstRule, secondRule) =>
      compareRules(firstRule, secondRule, selectedSituation),
    )

  const candidateRules = uniqueRules([
    ...matchingRules,
    ...goalBasedFallbackRules,
    ...broadFallbackRules,
  ])

  const recommendations = ensureMinimumRecommendations(
    buildBalancedSequence(candidateRules, recommendationCount),
    candidateRules,
    selectedFitnessLevel,
    selectedSituation,
    recommendationCount,
  )

  return {
    summary: `Du möchtest ${selectedGoal || 'mehr Bewegung'} und nutzt ${formatList(
      selectedSetup,
    )}. Für ${selectedSituation || 'deinen Arbeitstag'} bleibt der Plan bewusst kurz, damit Bewegung realistisch wird.`,
    rhythm: buildRhythm(selectedSetup, selectedFitnessLevel),
    movements: recommendations.map(toMovementCardData),
  }
}

function matchesRule(
  rule,
  { selectedFitnessLevel, selectedGoal, selectedSetup },
) {
  return (
    hasAnySetup(rule, selectedSetup) &&
    matchesGoal(rule, selectedGoal) &&
    matchesFitnessLevel(rule, selectedFitnessLevel)
  )
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

function matchesSituation(rule, selectedSituation) {
  return !selectedSituation || rule.situations.includes(selectedSituation)
}

function compareRules(firstRule, secondRule, selectedSituation) {
  const firstSituationScore = matchesSituation(firstRule, selectedSituation) ? 1 : 0
  const secondSituationScore = matchesSituation(secondRule, selectedSituation) ? 1 : 0

  if (firstSituationScore !== secondSituationScore) {
    return secondSituationScore - firstSituationScore
  }

  return secondRule.priority - firstRule.priority
}

function getRecommendationCount(fitnessLevel) {
  return ['Level 1', 'Level 2'].includes(fitnessLevel)
    ? minimumRecommendations
    : maximumRecommendations
}

function buildBalancedSequence(rules, recommendationCount) {
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
  selectedFitnessLevel,
  selectedSituation,
  recommendationCount,
) {
  if (recommendations.length >= minimumRecommendations) {
    return recommendations
  }

  const lastResortRules = movementRules
    .filter((rule) => hasAnySetup(rule, fallbackSetups))
    .filter((rule) => matchesFitnessLevel(rule, selectedFitnessLevel))
    .filter(
      (rule) =>
        !existingCandidates.some((candidate) => candidate.id === rule.id) &&
        !recommendations.some((recommendation) => recommendation.id === rule.id),
    )
    .sort((firstRule, secondRule) =>
      compareRules(firstRule, secondRule, selectedSituation),
    )

  return buildBalancedSequence(
    [...recommendations, ...lastResortRules],
    recommendationCount,
  )
}

function canFollow(previousRule, nextRule) {
  if (!previousRule) {
    return true
  }

  if (previousRule.type === nextRule.type) {
    return false
  }

  if (nextRule.avoidAfterTypes.includes(previousRule.type)) {
    return false
  }

  if (previousRule.avoidAfterTypes.includes(nextRule.type)) {
    return false
  }

  if (isLongStandingRule(previousRule) && isLongStandingRule(nextRule)) {
    return false
  }

  return true
}

function isLongStandingRule(rule) {
  return rule.type === 'standing' && getLongestDuration(rule.duration) >= 10
}

function getLongestDuration(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  return numbers.length ? Math.max(...numbers) : 0
}

function uniqueRules(rules) {
  return rules.filter(
    (rule, index, list) => rule && list.findIndex((item) => item.id === rule.id) === index,
  )
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

function formatSetup(setups) {
  const visibleSetups = setups.filter((setup) => setup !== 'Kein spezielles Equipment')
  return visibleSetups.length ? visibleSetups.join(', ') : 'Kein Equipment'
}

function buildRhythm(selectedSetup, fitnessLevel) {
  if (selectedSetup.includes('Walking Pad')) {
    return 'Starte mit einer kurzen Aktivpause am Vormittag, nutze eine ruhige Walking-Phase für Meeting oder Fokusarbeit und schließe den Nachmittag mit leichter Mobilisation ab.'
  }

  if (selectedSetup.includes('Stehschreibtisch')) {
    return 'Wechsle alle 45 bis 60 Minuten zwischen Sitzen und Stehen. Nach längeren Stehphasen folgt bewusst wieder eine Sitz- oder Mobilisationsphase.'
  }

  if (['Level 1', 'Level 2'].includes(fitnessLevel)) {
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
