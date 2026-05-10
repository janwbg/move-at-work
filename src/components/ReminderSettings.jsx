import { useEffect, useState } from 'react'

const reminderStorageKey = 'move-at-work-reminder'
const reminderIntervals = [30, 60, 90]

function ReminderSettings() {
  const [settings, setSettings] = useState(() => loadReminderSettings())
  const [showReminder, setShowReminder] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(reminderStorageKey, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (!settings.enabled) {
      return undefined
    }

    const timeout = window.setTimeout(
      () => setShowReminder(true),
      settings.intervalMinutes * 60 * 1000,
    )

    return () => window.clearTimeout(timeout)
  }, [settings])

  function handleToggle(enabled) {
    setSettings((current) => ({
      ...current,
      enabled,
    }))

    if (!enabled) {
      setShowReminder(false)
    }
  }

  function handleIntervalChange(intervalMinutes) {
    setSettings((current) => ({
      ...current,
      intervalMinutes,
    }))
    setShowReminder(false)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Reminder
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Bewegungsimpulse nicht vergessen
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Solange die App geöffnet ist, erinnert sie dich nach dem gewählten
            Intervall.
          </p>
        </div>

        <label className="flex min-h-11 items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => handleToggle(event.target.checked)}
            className="h-4 w-4 accent-[#2563eb]"
          />
          Aktiv
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {reminderIntervals.map((interval) => (
          <button
            key={interval}
            type="button"
            onClick={() => handleIntervalChange(interval)}
            className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
              settings.intervalMinutes === interval
                ? 'bg-[#2563eb] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
            }`}
          >
            {interval} Minuten
          </button>
        ))}
      </div>

      {showReminder && (
        <div className="mt-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 p-4 text-sm font-semibold text-slate-700 dark:text-blue-50">
          Zeit für einen kurzen Bewegungsimpuls.
          <button
            type="button"
            onClick={() => setShowReminder(false)}
            className="ml-0 mt-3 block rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2563eb] dark:bg-white/10 sm:ml-3 sm:mt-0 sm:inline-block"
          >
            Ausblenden
          </button>
        </div>
      )}
    </section>
  )
}

function loadReminderSettings() {
  if (typeof window === 'undefined') {
    return { enabled: false, intervalMinutes: 60 }
  }

  try {
    const storedSettings = window.localStorage.getItem(reminderStorageKey)
    return storedSettings
      ? JSON.parse(storedSettings)
      : { enabled: false, intervalMinutes: 60 }
  } catch {
    return { enabled: false, intervalMinutes: 60 }
  }
}

export default ReminderSettings
