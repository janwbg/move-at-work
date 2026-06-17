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

  it('renders the gentle, standard and active modes', () => {
    const html = renderSettings({
      mode: 'active',
      enabledWindows: ['morning', 'lunch_transition', 'afternoon', 'wrap_up'],
    })

    expect(html).toContain('Sanft')
    expect(html).toContain('Standard')
    expect(html).toContain('Aktiv')
    expect(html).toMatch(/aria-pressed="true"[^>]*>.*Aktiv/s)
  })

  it('renders selectable reminder windows', () => {
    const html = renderSettings()

    expect(html).toContain('Vormittag')
    expect(html).toContain('Mittag')
    expect(html).toContain('Nachmittag')
    expect(html).toContain('Tagesabschluss')
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
    expect(html).toContain('Bis morgen pausieren')
    expect(html).toContain('Erinnerungen pausiert bis morgen.')
    expect(html).toContain('Pause beenden')
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

function renderSettings(settings = {}, currentDate = new Date(2026, 5, 17, 9, 30)) {
  return renderToStaticMarkup(
    <ReminderSettings
      currentDate={currentDate}
      initialSettings={{
        enabled: false,
        mode: 'standard',
        enabledWindows: ['morning', 'afternoon'],
        quietUntil: null,
        ...settings,
      }}
      onSettingsChange={() => {}}
    />,
  )
}
