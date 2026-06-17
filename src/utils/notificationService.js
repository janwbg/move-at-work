const reminderNotificationPrefix = 'move-at-work'

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  return window.Notification.permission ?? 'default'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  try {
    return await window.Notification.requestPermission()
  } catch {
    return getNotificationPermission()
  }
}

export function canShowSystemNotification({
  notificationApi,
  permission = getNotificationPermission(),
  settings,
} = {}) {
  const hasNotificationApi = Boolean(notificationApi) || isNotificationSupported()

  return Boolean(
    hasNotificationApi &&
      permission === 'granted' &&
      settings?.enabled &&
      settings?.systemNotificationsEnabled,
  )
}

export function showReminderNotification({
  body,
  notificationApi,
  permission = getNotificationPermission(),
  settings,
  slotId,
  tag,
  title,
} = {}) {
  if (
    !title ||
    !body ||
    !slotId ||
    !canShowSystemNotification({ notificationApi, permission, settings })
  ) {
    return null
  }

  const NotificationApi =
    notificationApi ?? (isNotificationSupported() ? window.Notification : null)

  if (!NotificationApi) {
    return null
  }

  try {
    const notification = new NotificationApi(title, {
      body,
      tag: tag ?? `${reminderNotificationPrefix}-${slotId}`,
    })

    if (typeof notification.addEventListener === 'function') {
      notification.addEventListener('click', () => {
        focusAppWindow()
      })
    } else {
      notification.onclick = () => focusAppWindow()
    }

    return notification
  } catch {
    return null
  }
}

export function isAppVisible({ documentRef = globalThis.document } = {}) {
  return documentRef?.visibilityState !== 'hidden'
}

export function createReminderNotificationTag({ dateKey, slotId }) {
  return `${reminderNotificationPrefix}-${dateKey}-${slotId}`
}

function focusAppWindow() {
  if (typeof window !== 'undefined' && typeof window.focus === 'function') {
    window.focus()
  }
}
