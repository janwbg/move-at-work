import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defaultDaySlotWindows,
  generatePlan,
  replaceRecommendationInPlan,
} from './generatePlan.js'
import { recordRecommendationFeedback } from './recommendationFeedbackStorage.js'
import {
  loadRecommendationHistory,
  saveRecommendationHistory,
} from './recommendationHistoryStorage.js'

const unavailableEquipment = [
  'Walking Pad',
  'Flur in der Nähe',
  'Treppe in der Nähe',
  'Höhenverstellbarer Schreibtisch',
  'Kleines Bewegungsequipment',
  'Platz für kurze Übungen',
  'Ergonomische Sitz- oder Stehhilfe',
]

beforeEach(() => {
  vi.stubGlobal('window', {
    localStorage: createLocalStorage(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generatePlan', () => {
  it('returns exactly five daily recommendations for broad and tight profiles', () => {
    const profiles = [
      {
        currentPhase: 'focus',
        currentWorkplace: 'homeoffice',
        defaultWorkplace: 'homeoffice',
        fitnessLevel: 'gentle',
        goal: 'habit',
        situation: 'focus-heavy',
        workplaces: ['homeoffice'],
        workplaceSetups: {
          office: ['stairs'],
          homeoffice: ['no-equipment'],
        },
      },
      {
        currentPhase: 'meeting',
        fitnessLevel: 'gentle',
        goal: 'sit-less',
        setup: ['no-equipment'],
        situation: 'meeting-heavy',
      },
      {
        currentPhase: 'break',
        fitnessLevel: 'gentle',
        goal: 'more-energy',
        setup: ['stairs'],
        situation: 'mixed-day',
      },
      {
        currentPhase: 'phone',
        currentWorkplace: 'homeoffice',
        defaultWorkplace: 'homeoffice',
        fitnessLevel: 'gentle',
        goal: 'sit-less',
        situation: 'meeting-heavy',
        workplaces: ['homeoffice'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['walking-pad'],
        },
      },
      {
        currentPhase: 'between-tasks',
        fitnessLevel: 'gentle',
        goal: 'sit-less',
        setup: ['standing-desk'],
        situation: 'meeting-heavy',
      },
    ]

    for (const profile of profiles) {
      expect(generatePlan(profile).dailySchedule).toHaveLength(5)
    }
  })

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
    expect(hasAnyMovementType(plan.dailySchedule, ['walking_meeting'])).toBe(true)
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

  it('creates a useful homeoffice plan without special equipment', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      currentWorkplace: 'homeoffice',
      defaultWorkplace: 'homeoffice',
      fitnessLevel: 'balanced',
      goal: 'habit',
      situation: 'focus-heavy',
      workplaces: ['homeoffice'],
      workplaceSetups: {
        office: ['walking-pad', 'hallway', 'stairs'],
        homeoffice: ['no-equipment'],
      },
    })

    expect(plan.dailySchedule.length).toBeGreaterThanOrEqual(5)
    expect(usesAnySetup(plan, unavailableEquipment)).toBe(false)
    expect(plan.dailySchedule.some((section) => section.ruleId.startsWith('home-'))).toBe(true)
    expect(plan.dailySchedule.every((section) => section.reason || section.explanation)).toBe(true)
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
    expect(getMaxMovementTypeCount(plan.dailySchedule)).toBeLessThanOrEqual(2)
  })

  it('reduces bodyArea repetitions across the daily schedule', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'back-neck',
      setup: ['no-equipment'],
      situation: 'focus-heavy',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(countAdjacentBodyAreaOverlaps(plan.dailySchedule)).toBeLessThanOrEqual(1)
    expect(getMaxBodyAreaCount(plan.dailySchedule)).toBeLessThanOrEqual(2)
  })

  it('reduces direct position repetition when alternatives exist', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'back-neck',
      setup: ['no-equipment'],
      situation: 'focus-heavy',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(getUniquePositions(plan.dailySchedule).length).toBeGreaterThanOrEqual(3)
    expect(countAdjacentPositionRepeats(plan.dailySchedule)).toBeLessThanOrEqual(1)
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

  it('adds slot ids and internal slot windows to all five daily slots', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'mixed-day',
    })

    expect(plan.dailySchedule.map((section) => section.slotId)).toEqual(
      defaultDaySlotWindows.map((slot) => slot.slotId),
    )
    expect(plan.dailySchedule.map((section) => section.slotLabel)).toEqual([
      'Start in den Arbeitstag',
      'Vormittag',
      'Mittagswechsel',
      'Nachmittag',
      'Tagesabschluss',
    ])
    expect(plan.dailySchedule.every((section) => section.slotWindowMeta)).toBe(true)
  })

  it('uses 08:00 as the internal standard start and keeps the configured slot windows', () => {
    expect(defaultDaySlotWindows[0].slotWindowMeta.startTime).toBe('08:00')
    expect(
      defaultDaySlotWindows.map((slot) => [
        slot.slotId,
        slot.slotWindowMeta.startTime,
        slot.slotWindowMeta.endTime,
      ]),
    ).toEqual([
      ['start', '08:00', '08:45'],
      ['morning', '09:30', '10:30'],
      ['lunch_transition', '12:00', '13:30'],
      ['afternoon', '14:00', '15:15'],
      ['wrap_up', '16:15', '17:00'],
    ])
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
    const microbreakTypes = [
      'breathing',
      'eyes',
      'mini_reset',
      'mobilize',
      'sit_reset',
      'walk',
    ]

    expect(plan.dailySchedule.slice(0, 4).every((section) => microbreakTypes.includes(section.movementType))).toBe(true)
    expect(plan.dailySchedule.slice(0, 4).every((section) => getLongestDuration(section.duration) <= 5)).toBe(true)
  })

  it('supports study-day profiles with focus, activation and screen relief impulses', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'focus',
      setup: ['no-equipment'],
      situation: 'study-day',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(
      plan.dailySchedule.some((section) =>
        section.bodyArea.some((bodyArea) =>
          ['eyes', 'neck', 'shoulders', 'upper-back', 'spine'].includes(
            bodyArea,
          ),
        ),
      ),
    ).toBe(true)
    expect(
      plan.dailySchedule.filter((section) => getLongestDuration(section.duration) <= 3)
        .length,
    ).toBeGreaterThanOrEqual(3)
  })

  it('supports tight-schedule profiles with short discreet microbreaks', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'tight-schedule',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(
      plan.dailySchedule.filter((section) => getLongestDuration(section.duration) <= 3)
        .length,
    ).toBeGreaterThanOrEqual(4)
    expect(
      plan.dailySchedule.filter((section) => section.visibilityLevel === 'discreet')
        .length,
    ).toBeGreaterThanOrEqual(3)
    expect(countSpecialSetupSections(plan.dailySchedule)).toBe(0)
  })

  it('keeps mini-resets from dominating a normal five-slot plan', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'focus',
      setup: ['no-equipment'],
      situation: 'focus-heavy',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(countMiniResets(plan.dailySchedule)).toBeLessThanOrEqual(1)
    expect(countSubstantiveSections(plan.dailySchedule)).toBeGreaterThanOrEqual(3)
  })

  it('allows more mini-resets for tight schedules without making the whole plan tiny', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'tight-schedule',
    })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(countMiniResets(plan.dailySchedule)).toBeLessThanOrEqual(2)
    expect(countMiniResets(plan.dailySchedule)).toBeGreaterThanOrEqual(1)
    expect(countSubstantiveSections(plan.dailySchedule)).toBeGreaterThanOrEqual(2)
    expect(countTinyMiniResets(plan.dailySchedule)).toBeLessThanOrEqual(2)
  })

  it('does not fill the lunch transition with an extremely short mini-reset', () => {
    const plan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'tight-schedule',
    })
    const lunchTransition = plan.dailySchedule.find(
      (section) => section.slotId === 'lunch_transition',
    )

    expect(lunchTransition).toBeTruthy()
    expect(isTinyMiniReset(lunchTransition)).toBe(false)
  })

  it('can include discreet mini-resets for focus and meeting contexts', () => {
    const focusPlan = generatePlan({
      currentPhase: 'focus',
      fitnessLevel: 'balanced',
      goal: 'focus',
      setup: ['no-equipment'],
      situation: 'tight-schedule',
    })
    const meetingPlan = generatePlan({
      currentPhase: 'meeting',
      currentWorkplace: 'office',
      defaultWorkplace: 'office',
      fitnessLevel: 'balanced',
      goal: 'focus',
      situation: 'meeting-heavy',
      workplaces: ['office'],
      workplaceSetups: {
        office: ['no-equipment'],
      },
    })

    expect(countMiniResets(focusPlan.dailySchedule)).toBeGreaterThanOrEqual(1)
    expect(
      meetingPlan.dailySchedule
        .filter((section) => section.movementType === 'mini_reset')
        .every((section) => section.visibilityLevel === 'discreet'),
    ).toBe(true)
  })

  it('uses currentWorkdayType over the stored profile workday type', () => {
    const profile = {
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'meeting-heavy',
    }
    const plan = generatePlan({
      ...profile,
      currentWorkdayType: 'study-day',
    })

    expect(profile.situation).toBe('meeting-heavy')
    expect(plan.summary).toContain('lern- oder studientag')
    expect(
      plan.dailySchedule.some((section) =>
        section.bodyArea.some((bodyArea) =>
          ['eyes', 'neck', 'shoulders', 'upper-back'].includes(bodyArea),
        ),
      ),
    ).toBe(true)
  })

  it('falls back to the profile workday type when currentWorkdayType is invalid', () => {
    const plan = generatePlan({
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'focus-heavy',
      currentWorkdayType: 'does-not-exist',
    })

    expect(plan.summary).toContain('fokusarbeit')
  })

  it('uses currentWorkdayType for low-time recommendations', () => {
    const plan = generatePlan({
      fitnessLevel: 'balanced',
      goal: 'habit',
      setup: ['no-equipment'],
      situation: 'mixed-day',
      currentWorkdayType: 'tight-schedule',
    })

    expect(plan.summary).toContain('wenig zeit')
    expect(
      plan.dailySchedule.filter((section) => getLongestDuration(section.duration) <= 3)
        .length,
    ).toBeGreaterThanOrEqual(4)
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

  it('uses hallway for walking impulses without creating stair recommendations', () => {
    const plan = generatePlan({
      currentPhase: 'phone',
      fitnessLevel: 'balanced',
      goal: 'more-energy',
      setup: ['hallway'],
      situation: 'meeting-heavy',
    })

    expect(hasAnyMovementType(plan.dailySchedule, ['walk'])).toBe(true)
    expect(hasRule(plan, 'office-hallway-loop')).toBe(true)
    expect(hasSetup(plan, 'Treppe in der Nähe')).toBe(false)
    expect(hasDisplaySetup(plan, 'Treppe in der Nähe')).toBe(false)
  })

  it('does not recommend hallway exercises when hallway is unavailable', () => {
    const plan = generatePlan({
      currentPhase: 'phone',
      fitnessLevel: 'balanced',
      goal: 'more-energy',
      setup: ['no-equipment'],
      situation: 'meeting-heavy',
    })

    expect(hasSetup(plan, 'Flur in der Nähe')).toBe(false)
  })

  it('uses stairs for stair impulses when stairs are available', () => {
    const plan = generatePlan({
      currentPhase: 'break',
      fitnessLevel: 'active',
      goal: 'more-energy',
      setup: ['stairs'],
      situation: 'mixed-day',
    })

    expect(hasSetup(plan, 'Treppe in der Nähe')).toBe(true)
    expect(hasDisplaySetup(plan, 'Treppe in der Nähe')).toBe(true)
    expect(hasRule(plan, 'office-hallway-loop')).toBe(false)
    expect(hasRule(plan, 'walking-call-hallway')).toBe(false)
  })

  it('does not recommend stair exercises when stairs are unavailable', () => {
    const plan = generatePlan({
      currentPhase: 'break',
      fitnessLevel: 'active',
      goal: 'more-energy',
      setup: ['hallway'],
      situation: 'mixed-day',
    })

    expect(hasSetup(plan, 'Treppe in der Nähe')).toBe(false)
  })

  it('uses only the setup of the current workplace', () => {
    const homeofficePlan = generatePlan({
      currentPhase: 'break',
      currentWorkplace: 'homeoffice',
      defaultWorkplace: 'office',
      fitnessLevel: 'active',
      goal: 'more-energy',
      situation: 'mixed-day',
      workplaces: ['office', 'homeoffice'],
      workplaceSetups: {
        office: ['stairs'],
        homeoffice: ['hallway'],
      },
    })
    const officePlan = generatePlan({
      currentPhase: 'break',
      currentWorkplace: 'office',
      defaultWorkplace: 'office',
      fitnessLevel: 'active',
      goal: 'more-energy',
      situation: 'mixed-day',
      workplaces: ['office', 'homeoffice'],
      workplaceSetups: {
        office: ['stairs'],
        homeoffice: ['hallway'],
      },
    })

    expect(hasSetup(homeofficePlan, 'Treppe in der Nähe')).toBe(false)
    expect(hasSetup(officePlan, 'Treppe in der Nähe')).toBe(true)
  })

  it('allows Walking Pad only at the current workplace', () => {
    const officePlan = generatePlan({
      currentPhase: 'meeting',
      currentWorkplace: 'office',
      defaultWorkplace: 'office',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      situation: 'meeting-heavy',
      workplaces: ['office', 'homeoffice'],
      workplaceSetups: {
        office: ['no-equipment'],
        homeoffice: ['walking-pad'],
      },
    })
    const homeofficePlan = generatePlan({
      currentPhase: 'meeting',
      currentWorkplace: 'homeoffice',
      defaultWorkplace: 'office',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      situation: 'meeting-heavy',
      workplaces: ['office', 'homeoffice'],
      workplaceSetups: {
        office: ['no-equipment'],
        homeoffice: ['walking-pad'],
      },
    })

    expect(hasSetup(officePlan, 'Walking Pad')).toBe(false)
    expect(hasSetup(homeofficePlan, 'Walking Pad')).toBe(true)
  })

  it('prefers discreet recommendations for office meetings', () => {
    const plan = generatePlan({
      currentPhase: 'meeting',
      currentWorkplace: 'office',
      defaultWorkplace: 'office',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      situation: 'meeting-heavy',
      workplaces: ['office'],
      workplaceSetups: {
        office: ['no-equipment'],
      },
    })
    const visibilityCounts = countBy(plan.dailySchedule, 'visibilityLevel')

    expect(visibilityCounts.discreet).toBeGreaterThan(visibilityCounts.visible ?? 0)
    expect(visibilityCounts.visible ?? 0).toBe(0)
  })

  it('allows visible homeoffice break recommendations when phase and setup fit', () => {
    const officePlan = generatePlan({
      currentPhase: 'break',
      currentWorkplace: 'office',
      defaultWorkplace: 'office',
      fitnessLevel: 'active',
      goal: 'more-energy',
      situation: 'mixed-day',
      workplaces: ['office'],
      workplaceSetups: {
        office: ['space'],
      },
    })
    const homeofficePlan = generatePlan({
      currentPhase: 'break',
      currentWorkplace: 'homeoffice',
      defaultWorkplace: 'homeoffice',
      fitnessLevel: 'active',
      goal: 'more-energy',
      situation: 'mixed-day',
      workplaces: ['homeoffice'],
      workplaceSetups: {
        homeoffice: ['space'],
      },
    })

    expect(countBy(homeofficePlan.dailySchedule, 'visibilityLevel').visible).toBeGreaterThan(0)
    expect(countBy(homeofficePlan.dailySchedule, 'visibilityLevel').visible).toBeGreaterThanOrEqual(
      countBy(officePlan.dailySchedule, 'visibilityLevel').visible ?? 0,
    )
  })

  it('uses the third slot as a movement impulse when suitable candidates exist', () => {
    const plan = generatePlan({
      currentPhase: 'between-tasks',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['hallway', 'standing-desk'],
      situation: 'mixed-day',
    })
    const movementSlot = plan.dailySchedule[2]

    expect(['walk', 'stand', 'activate', 'walking_meeting']).toContain(
      movementSlot.movementType,
    )
  })

  it('does not let special setup recommendations dominate the whole plan', () => {
    const plan = generatePlan({
      currentPhase: 'phone',
      fitnessLevel: 'balanced',
      goal: 'sit-less',
      setup: ['walking-pad', 'hallway', 'standing-desk'],
      situation: 'meeting-heavy',
    })

    expect(countSpecialSetupSections(plan.dailySchedule)).toBeLessThanOrEqual(2)
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
        section.reason.includes('Im Büro lassen sich kurze Wechsel gut nutzen'),
      ),
    ).toBe(true)
  })

  it('replaceRecommendationInPlan returns a different recommendation in the same slot', () => {
    const profile = createReplacementProfile()
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 0,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'meeting',
    })

    expect(result.replaced).toBe(true)
    expect(result.plan.dailySchedule).toHaveLength(plan.dailySchedule.length)
    expect(result.replacement.ruleId).not.toBe(plan.dailySchedule[0].ruleId)
    expect(result.replacement.timeLabel).toBe(plan.dailySchedule[0].timeLabel)
    expect(result.replacement.slotId).toBe(plan.dailySchedule[0].slotId)
    expect(result.replacement.slotWindowMeta).toEqual(
      plan.dailySchedule[0].slotWindowMeta,
    )
    expect(result.plan.dailySchedule.slice(1)).toEqual(plan.dailySchedule.slice(1))
  })

  it('keeps required setup and workplace rules during replacement', () => {
    const profile = createReplacementProfile({
      workplaceSetups: {
        office: ['no-equipment'],
        homeoffice: ['walking-pad', 'stairs', 'hallway', 'space', 'small-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'setup-mismatch',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.setup).toContain('Kein besonderes Equipment')
    expect(result.replacement.setup).not.toContain('Walking Pad')
    expect(result.replacement.setup).not.toContain('Treppe in der Nähe')
    expect(result.replacement.setup).not.toContain('Flur in der Nähe')
    expect(result.replacement.setup).not.toContain('Platz für kurze Übungen')
    expect(result.replacement.setup).not.toContain('Kleines Bewegungsequipment')
  })

  it('prefers discreet and short recommendations for meeting replacements', () => {
    const profile = createReplacementProfile()
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 0,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'meeting',
    })

    expect(result.replacement.visibilityLevel).toBe('discreet')
    expect(result.replacement.visibilityLevel).not.toBe('visible')
    expect(result.replacement.durationMinutes).toBeLessThanOrEqual(3)
  })

  it('prefers gentle calmer recommendations', () => {
    const profile = createReplacementProfile({ fitnessLevel: 'active' })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 0,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'calmer',
    })

    expect(result.replacement.intensity).toBe('Leicht')
    expect(['breathing', 'sit_reset', 'mobilize']).toContain(
      result.replacement.movementType,
    )
  })

  it('prefers short recommendations when there is no time', () => {
    const profile = createReplacementProfile()
    const plan = generatePlan(profile)
    const originalSection = plan.dailySchedule[1]
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'no-time',
    })

    expect(originalSection.durationMinutes).toBe(2)
    expect(result.replaced).toBe(true)
    expect(result.replacement.durationMinutes).toBeLessThan(
      originalSection.durationMinutes,
    )
  })

  it('keeps shorter as a legacy alias for the no-time replacement logic', () => {
    const profile = createReplacementProfile()
    const plan = generatePlan(profile)
    const noTimeResult = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'no-time',
    })
    const shorterResult = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'shorter',
    })

    expect(shorterResult.replaced).toBe(true)
    expect(shorterResult.replacement.durationMinutes).toBeLessThan(
      plan.dailySchedule[1].durationMinutes,
    )
    expect(shorterResult.replacement.ruleId).toBe(noTimeResult.replacement.ruleId)
  })

  it('prefers very short recommendations when there is little time', () => {
    const profile = createReplacementProfile({ fitnessLevel: 'active' })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 2,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'between-tasks',
      reason: 'no-time',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.durationMinutes).toBeLessThanOrEqual(2)
  })

  it('can use a mini-reset when replacement reason says there is no time', () => {
    const profile = createReplacementProfile({ goal: 'focus' })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 0,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'focus',
      reason: 'no-time',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.movementType).toBe('mini_reset')
    expect(result.replacement.durationMinutes).toBeLessThanOrEqual(1)
  })

  it('prefers walking impulses when the reason asks for walking', () => {
    const profile = createReplacementProfile({
      currentPhase: 'phone',
      goal: 'more-energy',
      workplaceSetups: {
        office: ['hallway'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'walk',
    })

    expect(result.replaced).toBe(true)
    expect(['walk', 'walking_meeting']).toContain(result.replacement.movementType)
  })

  it('prefers a less visible replacement when the original is too visible', () => {
    const profile = createReplacementProfile({
      currentPhase: 'phone',
      goal: 'more-energy',
      workplaceSetups: {
        office: ['hallway'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const originalIndex = plan.dailySchedule.findIndex(
      (section) => section.visibilityLevel === 'normal',
    )
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: originalIndex,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'too-visible',
    })

    expect(result.replaced).toBe(true)
    expect(getVisibilityRank(result.replacement.visibilityLevel)).toBeLessThan(
      getVisibilityRank(plan.dailySchedule[originalIndex].visibilityLevel),
    )
  })

  it('prefers a space-saving replacement when there is not enough room', () => {
    const profile = createReplacementProfile({
      currentPhase: 'phone',
      goal: 'more-energy',
      workplaceSetups: {
        office: ['hallway'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const originalIndex = plan.dailySchedule.findIndex(
      (section) => section.position === 'walking',
    )
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: originalIndex,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'no-space',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.setup).toContain('Kein besonderes Equipment')
    expect(['sitting', 'standing', 'mixed', 'desk']).toContain(
      result.replacement.position,
    )
    expect(['walk', 'walking_meeting', 'activate']).not.toContain(
      result.replacement.movementType,
    )
  })

  it('prefers a gentler replacement when the original is too hard', () => {
    const profile = createReplacementProfile({
      currentPhase: 'break',
      fitnessLevel: 'active',
      goal: 'more-energy',
      situation: 'mixed-day',
      workplaceSetups: {
        office: ['stairs', 'space', 'no-equipment'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const originalIndex = plan.dailySchedule.findIndex(
      (section) =>
        section.position === 'stairs' || section.movementType === 'activate',
    )
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: originalIndex,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'break',
      reason: 'too-hard',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.intensity).toBe('Leicht')
    expect(result.replacement.position).not.toBe('stairs')
    expect(result.replacement.movementType).not.toBe('activate')
  })

  it('prefers calm replacements and avoids activating walk impulses', () => {
    const profile = createReplacementProfile({
      currentPhase: 'phone',
      goal: 'more-energy',
      workplaceSetups: {
        office: ['hallway'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const originalIndex = plan.dailySchedule.findIndex(
      (section) => section.movementType === 'walk',
    )
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: originalIndex,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'calmer',
    })

    expect(result.replaced).toBe(true)
    expect(['breathing', 'sit_reset', 'mobilize', 'stretch', 'mini_reset']).toContain(
      result.replacement.movementType,
    )
    expect(['walk', 'walking_meeting', 'activate']).not.toContain(
      result.replacement.movementType,
    )
    expect(result.replacement.position).not.toBe('walking')
  })

  it('keeps walking replacements movement-oriented instead of quiet eye or breath resets', () => {
    const profile = createReplacementProfile({
      currentPhase: 'phone',
      goal: 'more-energy',
      workplaceSetups: {
        office: ['no-equipment'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 1,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'walk',
    })

    expect(result.replaced).toBe(true)
    expect(result.replacement.position).not.toBe('sitting')
    expect(result.replacement.bodyArea).not.toContain('eyes')
    expect(result.replacement.bodyArea).not.toContain('breathing')
  })

  it('keeps the replacement influence scoped to the selected slot', () => {
    const profile = createReplacementProfile({
      workplaceSetups: {
        office: ['hallway'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 3,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'phone',
      reason: 'walk',
    })

    expect(result.replaced).toBe(true)
    expect(result.plan.dailySchedule[3]).not.toEqual(plan.dailySchedule[3])
    expect(result.plan.dailySchedule.slice(0, 3)).toEqual(
      plan.dailySchedule.slice(0, 3),
    )
    expect(result.plan.dailySchedule.slice(4)).toEqual(plan.dailySchedule.slice(4))
  })

  it('prefers no-equipment recommendations for setup mismatch', () => {
    const profile = createReplacementProfile({
      workplaceSetups: {
        office: ['no-equipment', 'standing-desk', 'ergonomic-support'],
        homeoffice: ['no-equipment'],
      },
    })
    const plan = generatePlan(profile)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 2,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'setup-mismatch',
    })

    expect(result.replacement.setup).toContain('Kein besonderes Equipment')
  })

  it('does not reuse a recommendation already in the plan when alternatives exist', () => {
    const profile = createReplacementProfile()
    const plan = generatePlan(profile)
    const existingRuleIds = plan.dailySchedule
      .filter((_, index) => index !== 0)
      .map((section) => section.ruleId)
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 0,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'not-appealing',
    })

    expect(existingRuleIds).not.toContain(result.replacement.ruleId)
  })

  it('uses recent daily history to reduce direct ruleId repetition', () => {
    const profile = createRotationProfile()
    const previousDate = new Date(2026, 5, 24)
    const currentDate = new Date(2026, 5, 25)
    const previousPlan = generatePlan({ ...profile, currentDate: previousDate })
    const previousRuleIds = getRuleIds(previousPlan.dailySchedule)

    saveRecommendationHistory(
      [{ date: '2026-06-24', ruleIds: previousRuleIds }],
      currentDate,
    )

    const rotatedPlan = generatePlan({ ...profile, currentDate })
    const repeatedRuleIds = getRuleIds(rotatedPlan.dailySchedule).filter((ruleId) =>
      previousRuleIds.includes(ruleId),
    )

    expect(rotatedPlan.dailySchedule).toHaveLength(5)
    expect(repeatedRuleIds.length).toBeLessThan(previousRuleIds.length)
  })

  it('does not write recommendation history directly while generating a plan', () => {
    const currentDate = new Date(2026, 5, 25)

    generatePlan({ ...createRotationProfile(), currentDate })

    expect(loadRecommendationHistory(currentDate)).toEqual([])
  })

  it('keeps the daily plan stable within the same date', () => {
    const profile = createRotationProfile()
    const currentDate = new Date(2026, 5, 25)

    saveRecommendationHistory(
      [
        {
          date: '2026-06-24',
          ruleIds: [
            'seated-posture-reset',
            'mini-walk-60',
            'seated-calf-raises',
          ],
        },
      ],
      currentDate,
    )

    const firstPlan = generatePlan({ ...profile, currentDate })
    const secondPlan = generatePlan({ ...profile, currentDate })

    expect(getRuleIds(secondPlan.dailySchedule)).toEqual(
      getRuleIds(firstPlan.dailySchedule),
    )
  })

  it('keeps rotation safe when the available candidate pool is constrained', () => {
    const profile = createRotationProfile({
      currentPhase: 'meeting',
      fitnessLevel: 'gentle',
      goal: 'focus',
      situation: 'meeting-heavy',
    })
    const currentDate = new Date(2026, 5, 25)

    saveRecommendationHistory(
      [
        {
          date: '2026-06-24',
          ruleIds: [
            'meeting-posture-switch',
            'mini-shoulder-circles-30',
            'mini-screen-away-40',
            'mini-neck-60',
            'box-breathing-focus',
          ],
        },
      ],
      currentDate,
    )

    const plan = generatePlan({ ...profile, currentDate })

    expect(plan.dailySchedule).toHaveLength(5)
    expect(plan.dailySchedule.every((section) => section.reason || section.explanation)).toBe(true)
  })

  it('uses not-fit replacement feedback as a soft penalty in a similar context', () => {
    const profile = createReplacementProfile()
    const currentDate = new Date(2026, 5, 25)
    const basePlan = generatePlan({ ...profile, currentDate })
    const replacedSection = basePlan.dailySchedule[0]

    recordRecommendationFeedback(
      {
        recommendationId: replacedSection.ruleId,
        currentWorkplace: 'office',
        currentPhase: 'meeting',
        workdayType: 'meeting-heavy',
        feedback: 'not-fit',
        reason: 'too-visible',
        replacementReason: 'too-visible',
        slotId: replacedSection.slotId,
        action: 'replaced',
      },
      new Date(2026, 5, 24),
    )

    const adjustedPlan = generatePlan({ ...profile, currentDate })

    expect(adjustedPlan.dailySchedule[0].ruleId).not.toBe(replacedSection.ruleId)
  })

  it('does not apply not-fit feedback when only the workplace matches', () => {
    const profile = createReplacementProfile()
    const currentDate = new Date(2026, 5, 25)
    const baselineRuleIds = getRuleIds(
      generatePlan({ ...profile, currentDate }).dailySchedule,
    )

    recordRecommendationFeedback(
      {
        recommendationId: baselineRuleIds[0],
        currentWorkplace: 'office',
        feedback: 'not-fit',
      },
      new Date(2026, 5, 24),
    )

    expect(getRuleIds(generatePlan({ ...profile, currentDate }).dailySchedule)).toEqual(
      baselineRuleIds,
    )
  })

  it('applies not-fit feedback when workplace and another context signal match', () => {
    const profile = createReplacementProfile()
    const currentDate = new Date(2026, 5, 25)
    const basePlan = generatePlan({ ...profile, currentDate })
    const replacedSection = basePlan.dailySchedule[0]

    recordRecommendationFeedback(
      {
        recommendationId: replacedSection.ruleId,
        currentWorkplace: 'office',
        currentPhase: 'meeting',
        feedback: 'not-fit',
        action: 'replaced',
      },
      new Date(2026, 5, 24),
    )

    expect(generatePlan({ ...profile, currentDate }).dailySchedule[0].ruleId).not.toBe(
      replacedSection.ruleId,
    )
  })

  it('does not apply not-fit feedback as a blanket penalty in another context', () => {
    const profile = createRotationProfile({
      currentPhase: 'focus',
      currentWorkplace: 'homeoffice',
      defaultWorkplace: 'homeoffice',
      goal: 'focus',
      situation: 'focus-heavy',
      workplaces: ['homeoffice'],
      workplaceSetups: {
        office: ['no-equipment'],
        homeoffice: ['no-equipment'],
      },
    })
    const currentDate = new Date(2026, 5, 25)
    const baselineRuleIds = getRuleIds(
      generatePlan({ ...profile, currentDate }).dailySchedule,
    )

    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
    recordRecommendationFeedback(
      {
        recommendationId: 'mini-posture-60',
        currentWorkplace: 'office',
        currentPhase: 'meeting',
        workdayType: 'meeting-heavy',
        feedback: 'not-fit',
        reason: 'too-visible',
        replacementReason: 'too-visible',
        slotId: 'start',
        action: 'replaced',
      },
      new Date(2026, 5, 24),
    )

    expect(getRuleIds(generatePlan({ ...profile, currentDate }).dailySchedule)).toEqual(
      baselineRuleIds,
    )
  })

  it('keeps tight-schedule and study-day plans useful with rotation enabled', () => {
    const currentDate = new Date(2026, 5, 25)
    const tightPlan = generatePlan({
      ...createRotationProfile({
        currentPhase: 'focus',
        goal: 'focus',
        situation: 'tight-schedule',
      }),
      currentDate,
    })
    const studyPlan = generatePlan({
      ...createRotationProfile({
        currentPhase: 'focus',
        goal: 'focus',
        situation: 'study-day',
      }),
      currentDate,
    })

    expect(tightPlan.dailySchedule).toHaveLength(5)
    expect(
      tightPlan.dailySchedule.filter((section) => section.durationMinutes <= 3)
        .length,
    ).toBeGreaterThanOrEqual(3)
    expect(studyPlan.dailySchedule).toHaveLength(5)
    expect(
      studyPlan.dailySchedule.some((section) =>
        section.bodyArea.some((bodyArea) =>
          ['eyes', 'neck', 'shoulders'].includes(bodyArea),
        ),
      ),
    ).toBe(true)
  })
})

function createReplacementProfile(overrides = {}) {
  return {
    currentPhase: 'meeting',
    currentWorkplace: 'office',
    defaultWorkplace: 'office',
    fitnessLevel: 'balanced',
    goal: 'sit-less',
    situation: 'meeting-heavy',
    workplaces: ['office'],
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
    ...overrides,
  }
}

function createRotationProfile(overrides = {}) {
  return {
    currentPhase: 'between-tasks',
    currentWorkplace: 'office',
    defaultWorkplace: 'office',
    fitnessLevel: 'balanced',
    goal: 'sit-less',
    situation: 'mixed-day',
    workplaces: ['office'],
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
    ...overrides,
  }
}

function getRuleIds(schedule) {
  return schedule.map((section) => section.ruleId)
}

function getVisibilityRank(visibilityLevel) {
  return {
    discreet: 0,
    normal: 1,
    visible: 2,
  }[visibilityLevel]
}

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

function hasRule(plan, ruleId) {
  return [...plan.dailySchedule, ...plan.movements].some(
    (item) => item.ruleId === ruleId || item.id === ruleId,
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

function countAdjacentBodyAreaOverlaps(sections) {
  return sections.filter((section, index) => {
    const nextSection = sections[index + 1]

    return nextSection && hasBodyAreaOverlap(section, nextSection)
  }).length
}

function countAdjacentPositionRepeats(sections) {
  return sections.filter(
    (section, index) =>
      section.position &&
      section.position === sections[index + 1]?.position,
  ).length
}

function getMaxBodyAreaCount(sections) {
  const counts = countValues(sections.flatMap((section) => section.bodyArea ?? []))
  return Math.max(...Object.values(counts))
}

function getMaxMovementTypeCount(sections) {
  const counts = countValues(sections.map((section) => section.movementType))
  return Math.max(...Object.values(counts))
}

function getUniquePositions(sections) {
  return [...new Set(sections.map((section) => section.position))]
}

function countSpecialSetupSections(sections) {
  return sections.filter((section) => section.setup !== 'Kein besonderes Equipment')
    .length
}

function countMiniResets(sections) {
  return sections.filter((section) => section.movementType === 'mini_reset').length
}

function countTinyMiniResets(sections) {
  return sections.filter((section) => isTinyMiniReset(section)).length
}

function countSubstantiveSections(sections) {
  return sections.filter((section) => (section.durationMinutes ?? 0) > 1).length
}

function isTinyMiniReset(section) {
  return (
    section?.movementType === 'mini_reset' &&
    (section.durationMinutes ?? 0) <= 0.67
  )
}

function countBy(sections, field) {
  return countValues(sections.map((section) => section[field]))
}

function countValues(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

function hasBodyAreaOverlap(firstSection, secondSection) {
  return firstSection.bodyArea.some((bodyArea) =>
    secondSection.bodyArea.includes(bodyArea),
  )
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

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
