import { describe, expect, it } from 'vitest'
import { generatePlan } from './generatePlan.js'

const unavailableEquipment = [
  'Walking Pad',
  'Balance Board',
  'Stehhocker',
  'Gymnastikball',
  'Treppenstufen',
]

describe('generatePlan', () => {
  it('creates a meeting-aware Walking Pad plan when the setup is available', () => {
    const plan = generatePlan({
      currentPhase: 'meeting',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['walking-pad'],
      situation: 'meeting-heavy',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(plan.dailySchedule.length).toBeLessThanOrEqual(7)
    expect(hasSetup(plan, 'Walking Pad')).toBe(true)
    expect(
      plan.dailySchedule.some(
        (section) =>
          section.reason.includes('Meeting') || section.title.includes('Meeting'),
      ),
    ).toBe(true)
  })

  it('uses only available setup rules for no-equipment back and neck support', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'gentle',
      goal: 'back-neck',
      setup: ['no-equipment'],
      situation: 'focus-heavy',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(usesAnySetup(plan, unavailableEquipment)).toBe(false)
    expect(
      plan.dailySchedule.filter((section) =>
        ['mobility', 'posture', 'walking'].includes(section.movementType),
      ).length,
    ).toBeGreaterThanOrEqual(4)
  })

  it('creates a standing-desk plan without adjacent long standing phases', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'active',
      goal: 'sit-less',
      setup: ['standing-desk'],
      situation: 'mixed-day',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(hasDisplaySetup(plan, 'Hoehenverstellbarer Schreibtisch')).toBe(true)
    expect(hasAdjacentLongStandingSections(plan.dailySchedule)).toBe(false)
  })

  it('avoids adjacent intense or identical movement types', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'active',
      goal: 'focus',
      setup: ['walking-pad', 'standing-desk'],
      situation: 'focus-heavy',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(hasAdjacentIntenseSections(plan.dailySchedule)).toBe(false)
    expect(hasAdjacentIdenticalMovementTypes(plan.dailySchedule)).toBe(false)
  })

  it('falls back safely when old or invalid stored values are present', () => {
    const plan = generatePlan({
      fitnessLevel: 'Level 3',
      goal: 'Bessere Konzentration',
      setup: ['does-not-exist'],
      situation: 'Mixed Day',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(usesAnySetup(plan, unavailableEquipment)).toBe(false)
  })
})

function hasSetup(plan, setup) {
  return [...plan.dailySchedule, ...plan.movements].some((item) =>
    item.setup.includes(setup),
  )
}

function hasDisplaySetup(plan, setup) {
  return [...plan.dailySchedule, ...plan.movements].some((item) =>
    item.setup.includes(setup) || item.displaySetup?.includes(setup),
  )
}

function usesAnySetup(plan, setups) {
  return [...plan.dailySchedule, ...plan.movements].some((item) =>
    setups.some((setup) => item.setup.includes(setup)),
  )
}

function hasAdjacentLongStandingSections(sections) {
  return sections.some((section, index) => {
    const nextSection = sections[index + 1]

    return nextSection && isLongStanding(section) && isLongStanding(nextSection)
  })
}

function hasAdjacentIntenseSections(sections) {
  return sections.some((section, index) => {
    const nextSection = sections[index + 1]

    return nextSection && isIntense(section) && isIntense(nextSection)
  })
}

function hasAdjacentIdenticalMovementTypes(sections) {
  return sections.some(
    (section, index) =>
      sections[index + 1]?.movementType === section.movementType,
  )
}

function isLongStanding(section) {
  return section.movementType === 'standing' && getLongestDuration(section.duration) >= 10
}

function isIntense(section) {
  return ['Mittel', 'Hoch'].includes(section.intensity)
}

function getLongestDuration(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  return numbers.length ? Math.max(...numbers) : 0
}
