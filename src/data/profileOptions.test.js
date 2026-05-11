import { describe, expect, it } from 'vitest'
import {
  goalOptions,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  toggleSetupSelection,
  workdayOptions,
  workplaceOptions,
  workPhaseOptions,
} from './profileOptions.js'

describe('profileOptions', () => {
  it('contains the final goal options', () => {
    expect(goalOptions.map((option) => option.label)).toEqual([
      'Weniger sitzen',
      'Mehr Energie im Arbeitstag',
      'Ruecken & Nacken entlasten',
      'Konzentration halten',
      'Bewegung zur Gewohnheit machen',
    ])
  })

  it('contains the final setup options', () => {
    expect(setupOptions.map((option) => option.id)).toEqual([
      'no-equipment',
      'standing-desk',
      'walking-pad',
      'exercise-space',
      'small-equipment',
      'stairs-hallway',
      'ergonomic-support',
    ])
  })

  it('keeps no-equipment exclusive in setup multi-select', () => {
    expect(toggleSetupSelection(['no-equipment'], 'walking-pad')).toEqual([
      'walking-pad',
    ])
    expect(toggleSetupSelection(['walking-pad'], 'no-equipment')).toEqual([
      'no-equipment',
    ])
  })

  it('contains the final intensity and workday options', () => {
    expect(intensityOptions.map((option) => option.label)).toEqual([
      'Sanft',
      'Ausgeglichen',
      'Aktiv',
    ])
    expect(workdayOptions.map((option) => option.label)).toEqual([
      'Viel Fokusarbeit',
      'Viele Meetings',
      'Gemischter Arbeitstag',
    ])
  })

  it('contains optional work phases for the Today screen', () => {
    expect(workPhaseOptions.map((option) => option.label)).toEqual([
      'Fokusarbeit',
      'Meeting',
      'Telefonat',
      'Pause',
      'Zwischen zwei Aufgaben',
    ])
  })

  it('contains the workplace profile options', () => {
    expect(workplaceOptions.map((option) => option.id)).toEqual([
      'office',
      'homeoffice',
    ])
    expect(workplaceOptions.map((option) => option.label)).toEqual([
      'Buero',
      'Homeoffice',
    ])
  })

  it('migrates old stored profile values to current ids', () => {
    expect(
      normalizeProfileAnswers({
        fitnessLevel: 'Level 2',
        goal: 'Weniger Rueckenschmerzen',
        setup: ['Kein spezielles Equipment', 'Walking Pad'],
        situation: 'Fokustag',
      }),
    ).toEqual({
      fitnessLevel: 'gentle',
      goal: 'back-neck',
      setup: ['walking-pad'],
      situation: 'focus-heavy',
      workplaces: ['office'],
      defaultWorkplace: 'office',
      currentWorkplace: 'office',
      workplaceSetups: {
        office: ['walking-pad'],
        homeoffice: ['no-equipment'],
      },
    })
  })

  it('keeps existing workplace profiles and falls back safely', () => {
    expect(normalizeProfileAnswers({ workplaceProfile: 'homeoffice' }).workplaces).toEqual(['homeoffice'])
    expect(normalizeProfileAnswers({ workplaceProfile: 'mixed' }).workplaces).toEqual(['office', 'homeoffice'])
    expect(normalizeProfileAnswers({ workplaceProfile: 'unknown' }).workplaces).toEqual(['office'])
  })
})
