import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canUseReplacement,
  loadReplacementUsage,
  normalizeReplacementUsage,
  recordReplacementUsage,
  saveReplacementUsage,
} from './replacementUsageStorage.js'

describe('replacementUsageStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('allows one Free replacement and blocks the next one on the same day', () => {
    const date = new Date(2026, 5, 23)

    expect(canUseReplacement({ premiumStatus: 'free', date })).toBe(true)

    const usage = recordReplacementUsage(date)

    expect(usage).toEqual({
      date: '2026-06-23',
      replacementsUsed: 1,
    })
    expect(canUseReplacement({ premiumStatus: 'free', usage, date })).toBe(false)
  })

  it('allows Plus replacements regardless of usage count', () => {
    const date = new Date(2026, 5, 23)
    const usage = { date: '2026-06-23', replacementsUsed: 99 }

    expect(canUseReplacement({ premiumStatus: 'plus', usage, date })).toBe(true)
  })

  it('resets usage on the next calendar day', () => {
    saveReplacementUsage(
      { date: '2026-06-23', replacementsUsed: 1 },
      new Date(2026, 5, 23),
    )

    expect(loadReplacementUsage(new Date(2026, 5, 24))).toEqual({
      date: '2026-06-24',
      replacementsUsed: 0,
    })
    expect(
      canUseReplacement({
        premiumStatus: 'free',
        date: new Date(2026, 5, 24),
      }),
    ).toBe(true)
  })

  it('normalizes invalid stored data robustly', () => {
    window.localStorage.setItem('move-at-work-replacement-usage', '{')
    expect(loadReplacementUsage(new Date(2026, 5, 23))).toEqual({
      date: '2026-06-23',
      replacementsUsed: 0,
    })

    window.localStorage.setItem(
      'move-at-work-replacement-usage',
      JSON.stringify({ date: '2026-06-23', replacementsUsed: -3 }),
    )
    expect(loadReplacementUsage(new Date(2026, 5, 23))).toEqual({
      date: '2026-06-23',
      replacementsUsed: 0,
    })

    expect(
      normalizeReplacementUsage(
        { date: '2026-06-23', replacementsUsed: '1.8' },
        new Date(2026, 5, 23),
      ),
    ).toEqual({
      date: '2026-06-23',
      replacementsUsed: 1,
    })
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}
