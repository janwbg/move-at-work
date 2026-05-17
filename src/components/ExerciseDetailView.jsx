import { useEffect, useState } from 'react'
import { getTimerActionLabel, shouldAdvanceTimer } from './exerciseTimer.js'
import { replacementReasonOptions } from './replacementReasons.js'

function ExerciseDetailView({
  completed,
  initialReplaceDialogOpen = false,
  initialRemainingSeconds,
  initialTimerState = 'idle',
  onBack,
  onComplete,
  onReplace = () => {},
  section,
}) {
  const durationSeconds = getDurationSeconds(section.duration)
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialRemainingSeconds ?? durationSeconds,
  )
  const [timerState, setTimerState] = useState(initialTimerState)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(
    initialReplaceDialogOpen,
  )
  const instructionSteps = Array.isArray(section.instructionSteps)
    ? section.instructionSteps.filter(Boolean)
    : []
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

  function submitReplacement(reason) {
    if (completed) {
      return
    }

    onReplace(reason)
    setReplaceDialogOpen(false)
    resetTimer()
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#f7f8fb] px-4 py-5 text-slate-950 dark:bg-[#121212] dark:text-white sm:px-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
          >
            Zurück
          </button>
          <p className="min-w-0 truncate text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            {section.timeLabel}
          </p>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-7">
          <header>
            <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
              {section.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <DetailBadge>{section.duration}</DetailBadge>
              {section.setup && <DetailBadge>{section.setup}</DetailBadge>}
              {completed && <DetailBadge tone="success">Erledigt</DetailBadge>}
            </div>
            {section.reason && (
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                {section.reason}
              </p>
            )}
            {completed && (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
                Diese Übung ist erledigt.
              </p>
            )}
          </header>

          {instructionSteps.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-extrabold tracking-normal text-slate-950 dark:text-white">
                So geht&apos;s
              </h2>
              <ol className="mt-3 space-y-3 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {instructionSteps.map((step) => (
                  <li className="pl-1" key={step}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                  Timer
                </p>
                <p className="mt-1 font-mono text-3xl font-extrabold text-slate-950 dark:text-white">
                  {timerState === 'finished' ? 'Beendet' : formatSeconds(remainingSeconds)}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {!completed && (
                  <>
                    {timerActionLabel && (
                      <button
                        type="button"
                        onClick={handleTimerAction}
                        className="min-h-11 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                      >
                        {timerActionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onComplete}
                      className="min-h-11 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      Als erledigt markieren
                    </button>
                  </>
                )}
                {shouldShowReset && (
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="min-h-11 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 dark:border-white/10 dark:text-slate-300"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </section>

          {!completed && (
            <section className="mt-5">
              <button
                type="button"
                onClick={() => setReplaceDialogOpen(true)}
                className="min-h-11 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
              >
                Andere Empfehlung
              </button>

              {replaceDialogOpen && (
                <div
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby={`${section.id}-detail-replace-title`}
                  className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
                >
                  <p
                    id={`${section.id}-detail-replace-title`}
                    className="text-sm font-extrabold text-slate-900 dark:text-white"
                  >
                    Warum möchtest du diese Empfehlung wechseln?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {replacementReasonOptions.map((reason) => (
                      <button
                        type="button"
                        key={reason.id}
                        onClick={() => submitReplacement(reason.id)}
                        className="min-h-9 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                      >
                        {reason.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setReplaceDialogOpen(false)}
                      className="min-h-9 rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 dark:border-white/10 dark:text-slate-300"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </article>
      </section>
    </div>
  )
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

function getDurationSeconds(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? [2]
  return Math.max(...numbers) * 60
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export default ExerciseDetailView
