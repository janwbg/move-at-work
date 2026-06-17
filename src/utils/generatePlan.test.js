import { describe, expect, it } from 'vitest'
import {
  defaultDaySlotWindows,
  generatePlan,
  replaceRecommendationInPlan,
} from './generatePlan.js'

const unavailableEquipment = [
  'Walking Pad',
  'Flur oder kurzer Weg in der Nähe',
  'Treppe in der Nähe',
  'Höhenverstellbarer Schreibtisch',
  'Kleines Bewegungsequipment',
  'Platz für kurze Übungen',
  'Ergonomische Sitz- oder Stehhilfe',
]

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
    const microbreakTypes = ['breathing', 'eyes', 'mobilize', 'sit_reset', 'walk']

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

    expect(hasSetup(plan, 'Flur oder kurzer Weg in der Nähe')).toBe(false)
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
    expect(result.replacement.setup).not.toContain('Flur oder kurzer Weg in der Nähe')
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
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace: 2,
      profile,
      currentWorkplace: 'office',
      currentPhase: 'meeting',
      reason: 'no-time',
    })

    expect(result.replacement.durationMinutes).toBeLessThanOrEqual(2)
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
