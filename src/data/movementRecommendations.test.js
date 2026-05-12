import { describe, expect, it } from 'vitest'
import { movementRecommendations } from './movementRecommendations.js'

describe('movementRecommendations', () => {
  it('contains a structured recommendation library', () => {
    expect(movementRecommendations.length).toBeGreaterThanOrEqual(30)
  })

  it('defines the required fields for every recommendation', () => {
    for (const recommendation of movementRecommendations) {
      expect(recommendation.id).toBeTruthy()
      expect(recommendation.title).toBeTruthy()
      expect(recommendation.description).toBeTruthy()
      expect(recommendation.durationMinutes).toBeGreaterThan(0)
      expect(recommendation.movementType).toBeTruthy()
      expect(recommendation.reason || recommendation.explanation).toBeTruthy()
      expect(Array.isArray(recommendation.requiredSetup)).toBe(true)
      expect(Array.isArray(recommendation.suitableWorkplaces)).toBe(true)
      expect(Array.isArray(recommendation.suitablePhases)).toBe(true)
    }
  })

  it('covers the core movement and setup categories', () => {
    const movementTypes = new Set(
      movementRecommendations.map((recommendation) => recommendation.movementType),
    )
    const requiredSetups = new Set(
      movementRecommendations.flatMap((recommendation) => recommendation.requiredSetup),
    )

    expect([...movementTypes]).toEqual(
      expect.arrayContaining([
        'stand',
        'walk',
        'mobilize',
        'activate',
        'breathing',
        'eyes',
        'sit_reset',
        'walking_meeting',
      ]),
    )
    expect([...requiredSetups]).toEqual(
      expect.arrayContaining([
        'standing-desk',
        'walking-pad',
        'exercise-space',
        'small-equipment',
        'ergonomic-support',
        'hallway',
        'stairs',
      ]),
    )
  })
})
