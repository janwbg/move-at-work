import { useEffect, useState } from 'react'
import { getTimerActionLabel, shouldAdvanceTimer } from './exerciseTimer.js'
import ReplacementReasonPicker from './ReplacementReasonPicker.jsx'

function ExerciseDetailView({
  canReplace = true,
  completed,
  initialReplaceDialogOpen = false,
  initialRemainingSeconds,
  initialTimerState = 'idle',
  onBack,
  onComplete,
  onReplace = () => {},
  onReplaceBlocked = () => {},
  replacementLimitNotice = null,
  section,
}) {
  const durationSeconds = getDurationSeconds(section)
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialRemainingSeconds ?? durationSeconds,
  )
  const [timerState, setTimerState] = useState(initialTimerState)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(
    initialReplaceDialogOpen && canReplace,
  )
  const instructionSteps = Array.isArray(section.instructionSteps)
    ? section.instructionSteps.filter(Boolean)
    : []
  const { actionSteps, hint } = splitInstructionContent(instructionSteps)
  const metaItems = [section.timeLabel, formatSetupMeta(section.setup)].filter(Boolean)
  const shouldShowReset =
    !completed && (timerState !== 'idle' || remainingSeconds !== durationSeconds)
  const timerActionLabel = getTimerActionLabel(timerState)

  useEffect(() => {
    if (!shouldAdvanceTimer({ completed, timerState })) {
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
  }, [completed, timerState])

  function handleTimerAction() {
    if (completed || timerState === 'finished') {
      return
    }

    setTimerState((currentState) =>
      currentState === 'running' ? 'paused' : 'running',
    )
  }

  function resetTimer() {
    if (completed) {
      return
    }

    setTimerState('idle')
    setRemainingSeconds(durationSeconds)
  }

  function openReplacementDialog() {
    if (completed) {
      return
    }

    if (!canReplace) {
      setReplaceDialogOpen(false)
      onReplaceBlocked()
      return
    }

    setReplaceDialogOpen(true)
  }

  function submitReplacement(reason) {
    if (completed) {
      return
    }

    onReplace(reason)
    setReplaceDialogOpen(false)
    resetTimer()
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#f5f8f7] px-4 py-5 text-slate-950 dark:bg-[#0f1413] dark:text-white sm:px-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-9 items-center rounded-full px-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:text-slate-300 dark:hover:bg-white/[0.06]"
          >
            ← Zurück zum Tagesplan
          </button>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
          <header>
            {metaItems.length > 0 && (
              <p className="text-sm font-bold leading-6 text-teal-700 dark:text-teal-200">
                {metaItems.join(' · ')}
              </p>
            )}
            <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
              {section.title}
            </h1>
            {completed && (
              <div className="mt-3">
                <DetailBadge tone="success">Erledigt</DetailBadge>
              </div>
            )}
            {section.reason && (
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                {section.reason}
              </p>
            )}
            {completed && (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
                Diese Übung ist erledigt.
                <span className="mt-1 block font-semibold">
                  Sitzphase unterbrochen. Gut gemacht — du bleibst dran.
                </span>
              </p>
            )}
          </header>

          {actionSteps.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-extrabold tracking-normal text-slate-950 dark:text-white">
                So geht&apos;s
              </h2>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {actionSteps.map((step, index) => (
                  <li className="grid grid-cols-[1.75rem_1fr] gap-3" key={step}>
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600 dark:bg-white/10 dark:text-slate-200"
                    >
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {hint && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                  <p className="text-xs font-extrabold uppercase tracking-normal text-slate-500 dark:text-slate-400">
                    Hinweis
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {hint}
                  </p>
                </div>
              )}
            </section>
          )}

          <section className="mt-6 rounded-xl border border-teal-700/15 bg-teal-50 p-4 dark:border-teal-300/15 dark:bg-teal-300/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-200">
                  Timer
                </p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
                  {timerState === 'finished' ? 'Beendet' : formatSeconds(remainingSeconds)}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {getTimerStateHint({ completed, timerState })}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {!completed && (
                  <>
                    {timerActionLabel && (
                      <button
                        type="button"
                        onClick={handleTimerAction}
                        className="min-h-10 rounded-full bg-teal-700 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-teal-700/15 transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      >
                        {timerActionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onComplete}
                      className="min-h-10 rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-bold text-emerald-700 transition hover:border-emerald-500/50 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-400/20 dark:bg-white/5 dark:text-emerald-100"
                    >
                      Als erledigt markieren
                    </button>
                  </>
                )}
                {shouldShowReset && (
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="min-h-10 rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600 transition hover:border-teal-700/40 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-white/10 dark:text-slate-300"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </section>

          {!completed && (
            <section className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={openReplacementDialog}
                className="text-sm font-bold text-slate-600 transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 dark:text-slate-300"
              >
                Andere Empfehlung
              </button>

              {replacementLimitNotice}

              {canReplace && replaceDialogOpen && (
                <ReplacementReasonPicker
                  idPrefix={`${section.id}-detail`}
                  onCancel={() => setReplaceDialogOpen(false)}
                  onSelectReason={submitReplacement}
                />
              )}
            </section>
          )}
        </article>
      </section>
    </div>
  )
}

function splitInstructionContent(instructionSteps) {
  if (instructionSteps.length === 0) {
    return { actionSteps: [], hint: null }
  }

  const lastStep = instructionSteps[instructionSteps.length - 1]

  if (!isPracticeHint(lastStep)) {
    return { actionSteps: instructionSteps, hint: null }
  }

  return {
    actionSteps: instructionSteps.slice(0, -1),
    hint: lastStep,
  }
}

function isPracticeHint(step) {
  const normalizedStep = step.trim().toLowerCase()

  if (/^(hinweis:|achte darauf|arbeite danach|pausiere|stoppe)/.test(normalizedStep)) {
    return true
  }

  return (
    normalizedStep.includes('wenn') &&
    /(angenehm|unangenehm|komfortabel|sicher|schmerz)/.test(normalizedStep)
  )
}

function formatSetupMeta(setup) {
  if (!setup) {
    return ''
  }

  const normalizedSetup = setup.toLowerCase()

  if (
    normalizedSetup.includes('höhenverstell') ||
    normalizedSetup.includes('stehtisch')
  ) {
    return 'Am Stehtisch'
  }

  if (
    normalizedSetup.includes('kein besonderes equipment') ||
    normalizedSetup.includes('kein spezielles equipment')
  ) {
    return 'Ohne Equipment'
  }

  if (normalizedSetup.includes('platz')) {
    return 'Mit etwas Platz'
  }

  if (normalizedSetup.includes('flur')) {
    return 'Kurzer Weg'
  }

  if (normalizedSetup.includes('treppe')) {
    return 'Treppe verfügbar'
  }

  return setup
}

function DetailBadge({ children, tone = 'neutral' }) {
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${
        tone === 'success'
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100'
          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
      }`}
    >
      {children}
    </span>
  )
}

function getTimerStateHint({ completed, timerState }) {
  if (completed) {
    return 'Diese Übung ist erledigt; Timer und Wechsel bleiben gesperrt.'
  }

  if (timerState === 'running') {
    return 'Läuft gerade. Du kannst jederzeit pausieren.'
  }

  if (timerState === 'paused') {
    return 'Pausiert. Setze fort, wenn es wieder passt.'
  }

  if (timerState === 'finished') {
    return 'Timer beendet. Markiere die Übung als erledigt, wenn es passt.'
  }

  return 'Starte nur, wenn der Impuls gerade in deinen Tag passt.'
}

function getDurationSeconds(section) {
  if (typeof section.durationMinutes === 'number') {
    return Math.max(1, Math.round(section.durationMinutes * 60))
  }

  const duration = section.duration ?? ''

  if (duration.includes('Sekunde')) {
    const numbers = duration.match(/\d+/g)?.map(Number) ?? [120]
    return Math.max(...numbers)
  }

  const numbers = duration.match(/\d+/g)?.map(Number) ?? [2]
  return Math.max(...numbers) * 60
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export default ExerciseDetailView
