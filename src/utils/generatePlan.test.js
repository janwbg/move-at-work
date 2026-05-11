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
        ['mobilize', 'sit_reset', 'walk', 'breathing', 'stretch'].includes(
          section.movementType,
        ),
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
    expect(hasDisplaySetup(plan, 'Höhenverstellbarer Schreibtisch')).toBe(true)
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

  it('returns movement types and explanations for every recommendation', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'mixed-day',
    })

    expect([...plan.dailySchedule, ...plan.movements].every((item) => item.movementType)).toBe(true)
    expect([...plan.dailySchedule, ...plan.movements].every((item) => item.reason || item.explanation)).toBe(true)
  })

  it('does not place stand recommendations directly after stand recommendations', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'active',
      goal: 'sit-less',
      setup: ['standing-desk', 'ergonomic-support'],
      situation: 'mixed-day',
    })

    expect(hasAdjacentMovementType(plan.dailySchedule, 'stand')).toBe(false)
  })

  it('prefers short microbreaks during focus work', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'focus',
      setup: ['no-equipment', 'standing-desk'],
      situation: 'focus-heavy',
    })
    const microbreakTypes = ['breathing', 'eyes', 'mobilize', 'sit_reset', 'walk']

    expect(plan.dailySchedule.slice(0, 4).every((section) => microbreakTypes.includes(section.movementType))).toBe(true)
    expect(plan.dailySchedule.slice(0, 4).every((section) => getLongestDuration(section.duration) <= 5)).toBe(true)
  })

  it('allows fitting walking or standing recommendations for calls and meetings', () => {
    const meetingPlan = generatePlan({
      currentPhase: 'meeting',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['walking-pad', 'standing-desk'],
      situation: 'meeting-heavy',
    })
    const phonePlan = generatePlan({
      currentPhase: 'phone',
      fitnessLevel: 'balanced',
      goal: 'more-energy',
      setup: ['walking-pad', 'standing-desk'],
      situation: 'meeting-heavy',
    })

    expect(hasAnyMovementType(meetingPlan.dailySchedule, ['stand', 'walking_meeting'])).toBe(true)
    expect(hasAnyMovementType(phonePlan.dailySchedule, ['walk', 'walking_meeting', 'stand'])).toBe(true)
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

  it('uses office as the effective workplace for mixed profiles', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['no-equipment'],
      situation: 'mixed-day',
      workplaceProfile: 'mixed',
    })

    expect(plan.summary).toContain('Büro')
  })

  it('accepts workplace profiles and reflects homeoffice in the recommendation context', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'mixed-day',
      workplaceProfile: 'homeoffice',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(plan.summary).toContain('Homeoffice')
    expect(
      plan.dailySchedule.some((section) =>
        section.reason.includes('Im Homeoffice fehlen oft natürliche Wege'),
      ),
    ).toBe(true)
  })

  it('reflects office context in reasons or summary', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['no-equipment'],
      situation: 'mixed-day',
      workplaceProfile: 'office',
    })

    expect(plan.summary).toContain('Büro')
    expect(
      plan.dailySchedule.some((section) =>
        section.reason.includes('Im Büro lassen sich kurze Wege gut nutzen'),
      ),
    ).toBe(true)
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

function hasAdjacentMovementType(sections, movementType) {
  return sections.some(
    (section, index) =>
      section.movementType === movementType &&
      sections[index + 1]?.movementType === movementType,
  )
}

function hasAnyMovementType(sections, movementTypes) {
  return sections.some((section) => movementTypes.includes(section.movementType))
}

function isLongStanding(section) {
  return section.movementType === 'stand' && getLongestDuration(section.duration) >= 10
}

function isIntense(section) {
  return ['Mittel', 'Hoch'].includes(section.intensity)
}

function getLongestDuration(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  return numbers.length ? Math.max(...numbers) : 0
}
