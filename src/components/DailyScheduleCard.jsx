import { useEffect, useState } from 'react'

const movementTypeLabels = {
  balance: 'Stabilität',
  cycling: 'Kreislauf',
  mobility: 'Mobilisation',
  posture: 'Haltung',
  stairs: 'Aktive Pause',
  standing: 'Positionswechsel',
  strength: 'Kraft',
  walking: 'Leichte Bewegung',
}

function DailyScheduleCard({ completed, onComplete, section, stepNumber }) {
  const [expanded, setExpanded] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(getDurationSeconds(section.duration))
  const [timerState, setTimerState] = useState('idle')

  useEffect(() => {
    if (timerState !== 'running') {
      return undefined
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setTimerState('finished')
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timerState])

  function resetTimer() {
    setTimerState('idle')
    setRemainingSeconds(getDurationSeconds(section.duration))
  }

  return (
    <article className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3 sm:gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-sm font-extrabold text-white">
              {stepNumber}
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                {section.timeLabel}
              </p>
              <h3 className="mt-1 text-lg font-extrabold tracking-normal text-slate-950 dark:text-white">
                {section.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge>{section.duration}</Badge>
            <Badge>{movementTypeLabels[section.movementType] ?? section.movementType}</Badge>
            <Badge>{completed ? 'Erledigt' : 'Offen'}</Badge>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
          <p className="leading-7 text-slate-600 dark:text-slate-300">
            {section.description}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              Setup: {section.setup}
            </p>
            <p className="rounded-lg bg-[#2563eb]/10 p-3 text-sm font-semibold leading-6 text-slate-700 dark:text-blue-50">
              Warum: {section.reason}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              {timerState === 'finished' ? 'Beendet' : formatSeconds(remainingSeconds)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTimerState('running')}
                disabled={timerState === 'running' || timerState === 'finished'}
                className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                Timer starten
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 dark:border-white/10 dark:text-slate-300"
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                onClick={onComplete}
                disabled={completed}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-white dark:text-slate-950"
              >
                {completed ? 'Erledigt' : 'Als erledigt markieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

function Badge({ children }) {
  return (
    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
      {children}
    </span>
  )
}

function getDurationSeconds(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? [2]
  return Math.max(...numbers) * 60
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export default DailyScheduleCard
