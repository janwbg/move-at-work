import { useEffect, useState } from 'react'
import {
  getQuietUntilForPreset,
  loadReminderSettings,
  normalizeReminderSettings,
  reminderModeWindowDefaults,
  saveReminderSettings,
} from '../utils/reminderStorage.js'
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
} from '../utils/notificationService.js'
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

function ReminderSettings({
  currentDate = new Date(),
  initialNotificationPermission,
  initialNotificationSupported,
  initialSettings,
  onSettingsChange = () => {},
}) {
  const [settings, setSettings] = useState(() =>
    normalizeReminderSettings(initialSettings ?? loadReminderSettings()),
  )
  const [notificationPermission, setNotificationPermission] = useState(
    () => initialNotificationPermission ?? getNotificationPermission(),
  )
  const notificationSupported =
    initialNotificationSupported ?? isNotificationSupported()
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

  function handlePause(preset) {
    updateSettings((current) => ({
      ...current,
      quietUntil: getQuietUntilForPreset(preset, currentDate),
    }))
  }

  async function handleNotificationPermissionRequest() {
    const nextPermission = await requestNotificationPermission()
    setNotificationPermission(nextPermission)

    if (nextPermission === 'granted') {
      updateSettings((current) => ({
        ...current,
        systemNotificationsEnabled: true,
      }))
    }
  }

  function handleSystemNotificationToggle(enabled) {
    if (notificationPermission !== 'granted') {
      return
    }

    updateSettings((current) => ({
      ...current,
      systemNotificationsEnabled: enabled,
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

      {settings.enabled && (
        <SystemNotificationSettings
          notificationPermission={notificationPermission}
          notificationSupported={notificationSupported}
          onPermissionRequest={handleNotificationPermissionRequest}
          onToggle={handleSystemNotificationToggle}
          systemNotificationsEnabled={settings.systemNotificationsEnabled}
        />
      )}

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
        </div>
      </div>
    </section>
  )
}

function SystemNotificationSettings({
  notificationPermission,
  notificationSupported,
  onPermissionRequest,
  onToggle,
  systemNotificationsEnabled,
}) {
  if (!notificationSupported || notificationPermission === 'unsupported') {
    return (
      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
          System-Benachrichtigungen
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Dein Browser unterstützt System-Benachrichtigungen hier nicht.
        </p>
      </section>
    )
  }

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            System-Benachrichtigungen
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Erhalte Hinweise auch dann, wenn Move at work im Hintergrund geöffnet
            ist.
          </p>
        </div>

        {notificationPermission === 'granted' && (
          <label className="flex min-h-10 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
            <input
              checked={systemNotificationsEnabled}
              className="h-4 w-4 accent-[#2563eb]"
              onChange={(event) => onToggle(event.target.checked)}
              type="checkbox"
            />
            System-Benachrichtigungen nutzen
          </label>
        )}
      </div>

      {notificationPermission === 'default' && (
        <div className="mt-3">
          <button
            className="min-h-10 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8]"
            onClick={onPermissionRequest}
            type="button"
          >
            Benachrichtigungen erlauben
          </button>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Dein Browser fragt dich anschließend nach der Erlaubnis.
          </p>
        </div>
      )}

      {notificationPermission === 'granted' && (
        <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
          System-Benachrichtigungen sind aktiviert.
        </p>
      )}

      {notificationPermission === 'denied' && (
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          Benachrichtigungen wurden blockiert. Du kannst sie in den
          Browser-Einstellungen wieder erlauben.
        </p>
      )}
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
