import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadRecommendationHistory,
  normalizeRecommendationHistory,
  recordRecommendationHistory,
  saveRecommendationHistory,
} from './recommendationHistoryStorage.js'

describe('recommendationHistoryStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores played recommendation rule ids for the current date', () => {
    const history = recordRecommendationHistory(
      ['neck-mobility-focus', 'neck-mobility-focus', '', 'standing-reset-no-equipment'],
      new Date(2026, 5, 25),
    )

    expect(history).toEqual([
      {
        date: '2026-06-25',
        ruleIds: ['neck-mobility-focus', 'standing-reset-no-equipment'],
      },
    ])
    expect(loadRecommendationHistory(new Date(2026, 5, 25))).toEqual(history)
  })

  it('normalizes legacy object data and ignores invalid or old entries', () => {
    const history = normalizeRecommendationHistory(
      {
        '2026-06-24': ['a', 'a', 'b'],
        '2026-06-11': ['too-old'],
        '2026-06-99': ['bad-date'],
        invalid: ['bad'],
        '2026-06-25': [],
      },
      new Date(2026, 5, 25),
    )

    expect(history).toEqual([
      {
        date: '2026-06-24',
        ruleIds: ['a', 'b'],
      },
    ])
  })

  it('does not break on invalid localStorage data', () => {
    window.localStorage.setItem('move-at-work-recommendation-history', '{')
    expect(loadRecommendationHistory(new Date(2026, 5, 25))).toEqual([])

    window.localStorage.setItem(
      'move-at-work-recommendation-history',
      JSON.stringify([{ date: '2026-06-25', ruleIds: [123, 'valid'] }]),
    )
    expect(loadRecommendationHistory(new Date(2026, 5, 25))).toEqual([
      {
        date: '2026-06-25',
        ruleIds: ['valid'],
      },
    ])
  })

  it('keeps only the latest 14-day history window when saving', () => {
    const history = saveRecommendationHistory(
      [
        { date: '2026-06-10', ruleIds: ['old'] },
        { date: '2026-06-12', ruleIds: ['first-kept'] },
        { date: '2026-06-25', ruleIds: ['today'] },
      ],
      new Date(2026, 5, 25),
    )

    expect(history.map((entry) => entry.date)).toEqual([
      '2026-06-12',
      '2026-06-25',
    ])
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
