const premiumStatusStorageKey = 'move-at-work-premium-status'

export const premiumStatuses = {
  free: 'free',
  plus: 'plus',
}

export function normalizePremiumStatus(status) {
  return status === premiumStatuses.plus ? premiumStatuses.plus : premiumStatuses.free
}

export function loadPremiumStatus() {
  if (typeof window === 'undefined') {
    return premiumStatuses.free
  }

  try {
    return normalizePremiumStatus(
      window.localStorage.getItem(premiumStatusStorageKey),
    )
  } catch {
    return premiumStatuses.free
  }
}

export function savePremiumStatus(status) {
  if (typeof window === 'undefined') {
    return premiumStatuses.free
  }

  const normalizedStatus = normalizePremiumStatus(status)
  window.localStorage.setItem(premiumStatusStorageKey, normalizedStatus)

  return normalizedStatus
}

export function isPlusUser(status = loadPremiumStatus()) {
  return normalizePremiumStatus(status) === premiumStatuses.plus
}

