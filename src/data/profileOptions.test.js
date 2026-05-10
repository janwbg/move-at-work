import { describe, expect, it } from 'vitest'
import {
  goalOptions,
  setupOptions,
  workdayOptions,
} from './profileOptions.js'

describe('profileOptions', () => {
  it('keeps the onboarding order focused on goal before setup', () => {
    expect(goalOptions).toEqual([
      'mehr Bewegung',
      'gegen Verspannungen',
      'Kraft aufbauen',
      'mehr Energie',
    ])
  })

  it('contains the reduced typical workday options with descriptions', () => {
    expect(workdayOptions).toEqual([
      {
        label: 'Fokustag',
        value: 'Fokustag',
        description: 'viel konzentrierte Einzelarbeit',
      },
      {
        label: 'Meetingtag',
        value: 'Meetingtag',
        description: 'viele Termine und Gespräche',
      },
      {
        label: 'Mixed Day',
        value: 'Mixed Day',
        description: 'Mischung aus Fokusarbeit, Meetings und Pausen',
      },
    ])
  })

  it('keeps setup choices available for profile settings', () => {
    expect(setupOptions).toContain('Bürostuhl')
    expect(setupOptions).toContain('Walking Pad')
    expect(setupOptions).toContain('Gymnastikball')
  })
})
