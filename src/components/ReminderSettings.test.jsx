import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ReminderSettings from './ReminderSettings.jsx'
import { getPauseStatus } from './reminderSettingsHelpers.js'
import { getQuietUntilForPreset } from '../utils/reminderStorage.js'

describe('ReminderSettings', () => {
  it('renders the reminder toggle with its description', () => {
    const html = renderSettings()

    expect(html).toContain('Erinnerungen aktivieren')
    expect(html).toContain(
      'Move at work erinnert dich in passenden Tagesfenstern an offene Bewegungsimpulse.',
    )
  })

  it('renders the gentle, normal and active modes', () => {
    const html = renderSettings({
      mode: 'active',
      enabledWindows: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
    })

    expect(html).toContain('Sanft')
    expect(html).toContain('Normal')
    expect(html).toContain('Aktiv')
    expect(html).toMatch(/aria-pressed="true"[^>]*>.*Aktiv/s)
  })

  it('does not render manually selectable reminder windows', () => {
    const html = renderSettings()

    expect(html).not.toContain('Zeitfenster auswählen')
    expect(html).not.toContain('Vormittag')
    expect(html).not.toContain('Mittag')
    expect(html).not.toContain('Nachmittag')
    expect(html).not.toContain('Tagesabschluss')
  })

  it('shows the pause controls and pause status', () => {
    const now = new Date(2026, 5, 17, 9, 30)
    const html = renderSettings(
      {
        quietUntil: getQuietUntilForPreset('tomorrow', now),
      },
      now,
    )

    expect(html).toContain('Für 1 Stunde pausieren')
    expect(html).toContain('Für heute pausieren')
    expect(html).not.toContain('Bis morgen pausieren')
    expect(html).toContain('Erinnerungen pausiert bis morgen.')
    expect(html).toContain('Pause beenden')
  })

  it('hides system notification settings while reminders are disabled', () => {
    const html = renderSettings({
      enabled: false,
    })

    expect(html).not.toContain('System-Benachrichtigungen')
  })

  it('shows system notification permission action when permission is default', () => {
    const html = renderSettings(
      {
        enabled: true,
      },
      new Date(2026, 5, 17, 9, 30),
      { notificationPermission: 'default' },
    )

    expect(html).toContain('System-Benachrichtigungen')
    expect(html).toContain('Benachrichtigungen erlauben')
    expect(html).toContain('Dein Browser fragt dich anschließend nach der Erlaubnis.')
  })

  it('shows enabled system notification status when permission is granted', () => {
    const html = renderSettings(
      {
        enabled: true,
        systemNotificationsEnabled: true,
      },
      new Date(2026, 5, 17, 9, 30),
      { notificationPermission: 'granted' },
    )

    expect(html).toContain('System-Benachrichtigungen sind aktiviert.')
    expect(html).toContain('System-Benachrichtigungen nutzen')
    expect(html).toContain('checked=""')
  })

  it('shows blocked system notification copy when permission is denied', () => {
    const html = renderSettings(
      {
        enabled: true,
        systemNotificationsEnabled: true,
      },
      new Date(2026, 5, 17, 9, 30),
      { notificationPermission: 'denied' },
    )

    expect(html).toContain('Benachrichtigungen wurden blockiert.')
    expect(html).not.toContain('System-Benachrichtigungen nutzen')
  })

  it('shows unsupported system notification fallback', () => {
    const html = renderSettings(
      {
        enabled: true,
      },
      new Date(2026, 5, 17, 9, 30),
      { notificationPermission: 'unsupported', notificationSupported: false },
    )

    expect(html).toContain(
      'Dein Browser unterstützt System-Benachrichtigungen hier nicht.',
    )
  })

  it('creates readable pause status for the supported quiet presets', () => {
    const now = new Date(2026, 5, 17, 9, 30)

    expect(getPauseStatus(getQuietUntilForPreset('one-hour', now), now)).toContain(
      'Erinnerungen pausiert bis',
    )
    expect(getPauseStatus(getQuietUntilForPreset('today', now), now)).toBe(
      'Erinnerungen pausiert für heute.',
    )
    expect(getPauseStatus(getQuietUntilForPreset('tomorrow', now), now)).toBe(
      'Erinnerungen pausiert bis morgen.',
    )
  })
})

function renderSettings(
  settings = {},
  currentDate = new Date(2026, 5, 17, 9, 30),
  {
    notificationPermission = 'default',
    notificationSupported = true,
  } = {},
) {
  return renderToStaticMarkup(
    <ReminderSettings
      currentDate={currentDate}
      initialNotificationPermission={notificationPermission}
      initialNotificationSupported={notificationSupported}
      initialSettings={{
        enabled: false,
        mode: 'normal',
        enabledWindows: ['morning', 'afternoon'],
        quietUntil: null,
        systemNotificationsEnabled: false,
        ...settings,
      }}
      onSettingsChange={() => {}}
    />,
  )
}
