import { describe, expect, it } from 'vitest'
import { movementRules } from './movementRules.js'

const requiredFields = [
  'id',
  'title',
  'description',
  'duration',
  'setup',
  'goals',
  'fitnessLevels',
  'situations',
  'intensity',
  'type',
  'avoidAfterTypes',
  'priority',
]

const expectedSetups = [
  'Höhenverstellbarer Schreibtisch',
  'Walking Pad',
  'Balance Board',
  'Stehhocker',
  'Gymnastikball',
  'Kein spezielles Equipment',
]

describe('movementRules', () => {
  it('contains all required fields on every rule', () => {
    for (const rule of movementRules) {
      for (const field of requiredFields) {
        expect(rule).toHaveProperty(field)
      }
    }
  })

  it('uses unique ids', () => {
    const ids = movementRules.map((rule) => rule.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses arrays for setup, goals, fitnessLevels, and situations', () => {
    for (const rule of movementRules) {
      expect(Array.isArray(rule.setup)).toBe(true)
      expect(Array.isArray(rule.goals)).toBe(true)
      expect(Array.isArray(rule.fitnessLevels)).toBe(true)
      expect(Array.isArray(rule.situations)).toBe(true)
    }
  })

  it('uses numeric priorities', () => {
    for (const rule of movementRules) {
      expect(typeof rule.priority).toBe('number')
    }
  })

  it('contains fallback rules for no special equipment', () => {
    expect(
      movementRules.some((rule) => rule.setup.includes('Kein spezielles Equipment')),
    ).toBe(true)
  })

  it('covers all expected setup options', () => {
    const coveredSetups = new Set(movementRules.flatMap((rule) => rule.setup))

    for (const setup of expectedSetups) {
      expect(coveredSetups.has(setup)).toBe(true)
    }
  })
})
