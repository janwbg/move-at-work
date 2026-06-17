import { useEffect, useState } from 'react'
import {
  getQuietUntilForPreset,
  loadReminderSettings,
  normalizeReminderSettings,
  reminderModeWindowDefaults,
  saveReminderSettings,
} from '../utils/reminderStorage.js'
import { getPauseStatus } from './reminderSettingsHelpers.js'

const reminderModes = [
  {
    id: 'gentle',
    label: 'Sanft',
    description: 'Wenige Hinweise',
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Sinnvolle Grundbegleitung',
  },
  {
    id: 'active',
    label: 'Aktiv',
    description: 'Mehr Hinweise über den Tag verteilt',
  },
]

const reminderWindows = [
  { id: 'morning', label: 'Vormittag' },
  { id: 'lunch_transition', label: 'Mittag' },
  { id: 'afternoon', label: 'Nachmittag' },
  { id: 'wrap_up', label: 'Tagesabschluss' },
]

function ReminderSettings({
  currentDate = new Date(),
  initialSettings,
  onSettingsChange = () => {},
}) {
  const [settings, setSettings] = useState(() =>
    normalizeReminderSettings(initialSettings ?? loadReminderSettings()),
  )
  const pauseStatus = getPauseStatus(settings.quietUntil, currentDate)

  useEffect(() => {
    saveReminderSettings(settings)
    onSettingsChange(settings)
  }, [onSettingsChange, settings])

  function updateSettings(updater) {
    setSettings((current) => normalizeReminderSettings(updater(current)))
  }

  function handleToggle(enabled) {
    updateSettings((current) => ({
      ...current,
      enabled,
    }))
  }

  function handleModeChange(mode) {
    updateSettings((current) => ({
      ...current,
      mode,
      enabledWindows: reminderModeWindowDefaults[mode],
    }))
  }

  function handleWindowToggle(windowId) {
    updateSettings((current) => {
      const enabledWindows = current.enabledWindows.includes(windowId)
        ? current.enabledWindows.filter((slotId) => slotId !== windowId)
        : [...current.enabledWindows, windowId]

      return {
        ...current,
        enabledWindows,
      }
    })
  }

  function handlePause(preset) {
    updateSettings((current) => ({
      ...current,
      quietUntil: getQuietUntilForPreset(preset, currentDate),
    }))
  }

  function endPause() {
    updateSettings((current) => ({
      ...current,
      quietUntil: null,
    }))
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Reminder
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Bewegungsimpulse passend erinnern
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Move at work erinnert dich in passenden Tagesfenstern an offene
            Bewegungsimpulse.
          </p>
        </div>

        <label className="flex min-h-11 items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => handleToggle(event.target.checked)}
            className="h-4 w-4 accent-[#2563eb]"
          />
          Erinnerungen aktivieren
        </label>
      </div>

      <div className="mt-5">
        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
          Erinnerungsmodus
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {reminderModes.map((mode) => {
            const isActive = settings.mode === mode.id

            return (
              <button
                aria-pressed={isActive}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-[#2563eb] bg-[#2563eb]/10 text-[#1d4ed8] dark:text-blue-100'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#2563eb]/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'
                }`}
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                type="button"
              >
                <span className="block text-sm font-extrabold">{mode.label}</span>
                <span className="mt-1 block text-sm font-semibold opacity-80">
                  {mode.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
          Zeitfenster auswählen
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {reminderWindows.map((windowOption) => (
            <label
              className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
              key={windowOption.id}
            >
              <input
                checked={settings.enabledWindows.includes(windowOption.id)}
                className="h-4 w-4 accent-[#2563eb]"
                onChange={() => handleWindowToggle(windowOption.id)}
                type="checkbox"
              />
              {windowOption.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              Nicht-stören
            </p>
            {pauseStatus && (
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {pauseStatus}
              </p>
            )}
          </div>
          {pauseStatus && (
            <button
              className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
              onClick={endPause}
              type="button"
            >
              Pause beenden
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <PauseButton onClick={() => handlePause('one-hour')}>
            Für 1 Stunde pausieren
          </PauseButton>
          <PauseButton onClick={() => handlePause('today')}>
            Für heute pausieren
          </PauseButton>
          <PauseButton onClick={() => handlePause('tomorrow')}>
            Bis morgen pausieren
          </PauseButton>
        </div>
      </div>
    </section>
  )
}

function PauseButton({ children, onClick }) {
  return (
    <button
      className="min-h-10 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:text-[#2563eb] dark:bg-white/10 dark:text-slate-200"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export default ReminderSettings
