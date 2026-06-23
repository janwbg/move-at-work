import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canShowSystemNotification,
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  showReminderNotification,
} from './notificationService.js'

const enabledSettings = {
  enabled: true,
  systemNotificationsEnabled: true,
}

describe('notificationService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detects missing Notification support', () => {
    vi.stubGlobal('window', {})

    expect(isNotificationSupported()).toBe(false)
    expect(getNotificationPermission()).toBe('unsupported')
  })

  it.each(['default', 'granted', 'denied'])(
    'detects %s notification permission',
    (permission) => {
      vi.stubGlobal('window', {
        Notification: createNotificationApi({ permission }),
      })

      expect(isNotificationSupported()).toBe(true)
      expect(getNotificationPermission()).toBe(permission)
    },
  )

  it('requests permission only through the explicit function', async () => {
    const requestPermission = vi.fn().mockResolvedValue('granted')
    vi.stubGlobal('window', {
      Notification: createNotificationApi({
        permission: 'default',
        requestPermission,
      }),
    })

    expect(getNotificationPermission()).toBe('default')
    expect(requestPermission).not.toHaveBeenCalled()

    await expect(requestNotificationPermission()).resolves.toBe('granted')
    expect(requestPermission).toHaveBeenCalledTimes(1)
  })

  it('does not throw when Notification is missing', async () => {
    vi.stubGlobal('window', {})

    expect(() =>
      showReminderNotification({
        body: 'Body',
        permission: 'granted',
        settings: enabledSettings,
        slotId: 'morning',
        title: 'Title',
      }),
    ).not.toThrow()
    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
  })

  it('does not show notifications when permission is not granted', () => {
    const NotificationApi = vi.fn()
    vi.stubGlobal('window', {
      Notification: createNotificationApi({ permission: 'denied' }),
    })

    expect(
      showReminderNotification({
        body: 'Body',
        notificationApi: NotificationApi,
        permission: 'denied',
        settings: enabledSettings,
        slotId: 'morning',
        title: 'Title',
      }),
    ).toBeNull()
    expect(NotificationApi).not.toHaveBeenCalled()
  })

  it('shows a notification when permission is granted and data is valid', () => {
    const NotificationApi = vi.fn(function NotificationMock(title, options) {
      this.title = title
      this.options = options
    })
    vi.stubGlobal('window', {
      Notification: createNotificationApi({ permission: 'granted' }),
    })

    const notification = showReminderNotification({
      body: 'Dein Impuls ist offen.',
      notificationApi: NotificationApi,
      permission: 'granted',
      settings: enabledSettings,
      slotId: 'morning',
      tag: 'move-at-work-2026-06-17-morning',
      title: 'Kleiner Wechselmoment?',
    })

    expect(notification).toBeTruthy()
    expect(NotificationApi).toHaveBeenCalledWith('Kleiner Wechselmoment?', {
      body: 'Dein Impuls ist offen.',
      tag: 'move-at-work-2026-06-17-morning',
    })
  })

  it('requires enabled reminder and system notification settings', () => {
    vi.stubGlobal('window', {
      Notification: createNotificationApi({ permission: 'granted' }),
    })

    expect(
      canShowSystemNotification({
        permission: 'granted',
        settings: { enabled: false, systemNotificationsEnabled: true },
      }),
    ).toBe(false)
    expect(
      canShowSystemNotification({
        permission: 'granted',
        settings: { enabled: true, systemNotificationsEnabled: false },
      }),
    ).toBe(false)
  })
})

function createNotificationApi({
  permission,
  requestPermission = vi.fn().mockResolvedValue(permission),
}) {
  return {
    permission,
    requestPermission,
  }
}
