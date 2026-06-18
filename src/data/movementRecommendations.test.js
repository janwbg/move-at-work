import { describe, expect, it } from 'vitest'
import { movementRecommendations } from './movementRecommendations.js'

const requiredFields = [
  'id',
  'title',
  'description',
  'durationMinutes',
  'movementType',
  'intensity',
  'suitableGoals',
  'suitableWorkplaces',
  'requiredSetup',
  'suitablePhases',
  'suitableWorkdayTypes',
  'reason',
  'explanation',
  'similarityGroup',
  'priority',
  'bodyArea',
  'position',
  'visibilityLevel',
  'instructionSteps',
]

const allowedMovementTypes = new Set([
  'stand',
  'walk',
  'mobilize',
  'stretch',
  'activate',
  'breathing',
  'sit_reset',
  'walking_meeting',
  'mini_reset',
])

const allowedBodyAreas = new Set([
  'neck',
  'shoulders',
  'upper-back',
  'lower-back',
  'spine',
  'chest',
  'hips',
  'legs',
  'calves',
  'feet',
  'wrists',
  'eyes',
  'breathing',
  'whole-body',
])

const allowedPositions = new Set([
  'sitting',
  'standing',
  'walking',
  'desk',
  'floor',
  'stairs',
  'mixed',
])

const allowedVisibilityLevels = new Set(['discreet', 'normal', 'visible'])

const allowedRequiredSetup = new Set([
  'no-equipment',
  'standing-desk',
  'walking-pad',
  'space',
  'small-equipment',
  'hallway',
  'stairs',
  'ergonomic-support',
])

describe('movementRecommendations', () => {
  it('contains the imported recommendations and mini-reset additions', () => {
    expect(movementRecommendations).toHaveLength(90)
  })

  it('defines every required field for every recommendation', () => {
    for (const recommendation of movementRecommendations) {
      for (const field of requiredFields) {
        expect(recommendation[field], `${recommendation.id}.${field}`).toBeDefined()
      }

      expect(recommendation.id).toBeTruthy()
      expect(recommendation.title).toBeTruthy()
      expect(recommendation.description).toBeTruthy()
      expect(recommendation.durationMinutes).toBeGreaterThan(0)
      expect(recommendation.priority).toBeGreaterThan(0)
      expect(recommendation.reason || recommendation.explanation).toBeTruthy()
      expect(Array.isArray(recommendation.requiredSetup)).toBe(true)
      expect(Array.isArray(recommendation.suitableGoals)).toBe(true)
      expect(Array.isArray(recommendation.suitableWorkplaces)).toBe(true)
      expect(Array.isArray(recommendation.suitablePhases)).toBe(true)
      expect(Array.isArray(recommendation.suitableWorkdayTypes)).toBe(true)
    }
  })

  it('uses only allowed movement, setup, body area, position and visibility values', () => {
    for (const recommendation of movementRecommendations) {
      expect(
        allowedMovementTypes.has(recommendation.movementType),
        recommendation.id,
      ).toBe(true)

      for (const setup of recommendation.requiredSetup) {
        expect(setup).not.toBe('22')
        expect(allowedRequiredSetup.has(setup), `${recommendation.id}.${setup}`).toBe(true)
      }

      for (const bodyArea of recommendation.bodyArea) {
        expect(allowedBodyAreas.has(bodyArea), `${recommendation.id}.${bodyArea}`).toBe(true)
      }

      expect(allowedPositions.has(recommendation.position), recommendation.id).toBe(true)
      expect(
        allowedVisibilityLevels.has(recommendation.visibilityLevel),
        recommendation.id,
      ).toBe(true)
    }
  })

  it('contains useful body areas and instruction steps', () => {
    for (const recommendation of movementRecommendations) {
      expect(Array.isArray(recommendation.bodyArea)).toBe(true)
      expect(recommendation.bodyArea.length, recommendation.id).toBeGreaterThan(0)
      expect(Array.isArray(recommendation.instructionSteps)).toBe(true)
      expect(recommendation.instructionSteps.length, recommendation.id).toBeGreaterThanOrEqual(3)
      expect(
        recommendation.instructionSteps.every((step) => step.trim().length >= 12),
        recommendation.id,
      ).toBe(true)
    }
  })
})
