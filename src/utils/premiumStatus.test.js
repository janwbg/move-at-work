import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isPlusUser,
  loadPremiumStatus,
  normalizePremiumStatus,
  premiumStatuses,
  savePremiumStatus,
} from './premiumStatus.js'

describe('premiumStatus helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to Free for missing or invalid values', () => {
    expect(loadPremiumStatus()).toBe(premiumStatuses.free)
    expect(normalizePremiumStatus('premium')).toBe(premiumStatuses.free)

    window.localStorage.setItem('move-at-work-premium-status', 'invalid')
    expect(loadPremiumStatus()).toBe(premiumStatuses.free)
  })

  it('recognizes Plus users', () => {
    window.localStorage.setItem('move-at-work-premium-status', 'plus')

    expect(loadPremiumStatus()).toBe(premiumStatuses.plus)
    expect(isPlusUser()).toBe(true)
    expect(isPlusUser('free')).toBe(false)
  })

  it('saves and loads normalized premium status values', () => {
    expect(savePremiumStatus('plus')).toBe(premiumStatuses.plus)
    expect(loadPremiumStatus()).toBe(premiumStatuses.plus)

    expect(savePremiumStatus('unknown')).toBe(premiumStatuses.free)
    expect(loadPremiumStatus()).toBe(premiumStatuses.free)
  })
})

function createLocalStorage() {
  const store = new Map()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  }
}

