import { getLocalDateKey } from '../utils/progressStorage.js'
import { markReminderShown } from '../utils/reminderStorage.js'
import {
  createReminderNotificationTag,
  getNotificationPermission,
  isAppVisible,
  showReminderNotification,
} from '../utils/notificationService.js'
import { getReminderNotificationCopy } from './reminderBannerHelpers.js'

export function maybeShowDueReminderNotification({
  activeWorkdayType,
  documentRef,
  dueReminder,
  notificationApi,
  now = new Date(),
  permission = getNotificationPermission(),
  settings,
  state,
} = {}) {
  if (!dueReminder || isAppVisible({ documentRef })) {
    return null
  }

  const copy = getReminderNotificationCopy({ activeWorkdayType })
  const notification = showReminderNotification({
    body: copy.body,
    notificationApi,
    permission,
    settings,
    slotId: dueReminder.slotId,
    tag: createReminderNotificationTag({
      dateKey: getLocalDateKey(now),
      slotId: dueReminder.slotId,
    }),
    title: copy.title,
  })

  if (!notification) {
    return null
  }

  return markReminderShown(state, dueReminder.slotId, now)
}
