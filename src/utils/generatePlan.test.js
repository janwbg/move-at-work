import { describe, expect, it } from 'vitest'
import { generatePlan } from './generatePlan.js'

const specialEquipment = [
  'Walking Pad',
  'Balance Board',
  'Stehhocker',
  'Gymnastikball',
]

describe('generatePlan', () => {
  it('creates a meeting-aware Walking Pad plan', () => {
    const plan = generatePlan({
      fitnessLevel: 'Einsteiger',
      goal: 'Mehr Bewegung im Arbeitsalltag',
      setup: ['Walking Pad'],
      situation: 'Meeting',
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

  it('uses only general movement for no-equipment back pain support', () => {
    const plan = generatePlan({
      fitnessLevel: 'Einsteiger',
      goal: 'Weniger Rückenschmerzen',
      setup: ['Kein spezielles Equipment'],
      situation: 'Langer Arbeitstag',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(plan.dailySchedule.length).toBeLessThanOrEqual(7)
    expect(usesAnySetup(plan, specialEquipment)).toBe(false)
    expect(
      plan.dailySchedule.filter((section) =>
        ['mobility', 'posture', 'walking'].includes(section.movementType),
      ).length,
    ).toBeGreaterThanOrEqual(4)
  })

  it('creates a standing-desk plan without adjacent long standing phases', () => {
    const plan = generatePlan({
      fitnessLevel: 'Fortgeschritten',
      goal: 'Bessere Haltung',
      setup: ['Höhenverstellbarer Schreibtisch'],
      situation: 'Fokusarbeit',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(hasSetup(plan, 'Höhenverstellbarer Schreibtisch')).toBe(true)
    expect(hasAdjacentLongStandingSections(plan.dailySchedule)).toBe(false)
  })

  it('avoids adjacent intense or identical movement types', () => {
    const plan = generatePlan({
      fitnessLevel: 'Aktiv',
      goal: 'Bessere Konzentration',
      setup: ['Walking Pad', 'Höhenverstellbarer Schreibtisch'],
      situation: 'Fokusarbeit',
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(hasAdjacentIntenseSections(plan.dailySchedule)).toBe(false)
    expect(hasAdjacentIdenticalMovementTypes(plan.dailySchedule)).toBe(false)
  })
})

function hasSetup(plan, setup) {
  return [...plan.dailySchedule, ...plan.movements].some((item) =>
    item.setup.includes(setup),
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

    return (
      nextSection &&
      isLongStanding(section) &&
      isLongStanding(nextSection)
    )
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
