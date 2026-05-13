import { useState } from 'react'
import { replacementReasonOptions } from './replacementReasons.js'

const movementTypeLabels = {
  activate: 'Aktivieren',
  breathing: 'Atmen',
  eyes: 'Augenpause',
  mobilize: 'Mobilisieren',
  relax: 'Entspannen',
  sit_reset: 'Sitz-Reset',
  stand: 'Stehen',
  stretch: 'Dehnen',
  walk: 'Gehen',
  walking_meeting: 'Walking-Meeting',
}

function DailyScheduleCard({
  completed,
  initialReplaceDialogOpen = false,
  onComplete,
  onOpenDetails,
  onReplace = () => {},
  section,
  stepNumber,
}) {
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(initialReplaceDialogOpen)

  function submitReplacement(reason) {
    onReplace(reason)
    setReplaceDialogOpen(false)
  }

  return (
    <article
      className={`relative rounded-lg border p-4 shadow-sm transition sm:p-5 ${
        completed
          ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/10'
          : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex gap-3 sm:gap-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                completed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2563eb] text-white'
              }`}
              aria-hidden="true"
            >
              {completed ? '✓' : stepNumber}
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                {section.timeLabel}
              </p>
              <h3
                className={`mt-1 text-lg font-extrabold tracking-normal ${
                  completed
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-950 dark:text-white'
                }`}
              >
                {section.title}
              </h3>
              {section.reason && (
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                  {section.reason}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            aria-label="Empfehlung wechseln"
            onClick={() => setReplaceDialogOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-extrabold text-slate-500 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            title="Empfehlung wechseln"
          >
            &#8635;
          </button>
          <Badge>{section.duration}</Badge>
          <Badge>{movementTypeLabels[section.movementType] ?? section.movementType}</Badge>
          {completed && <Badge tone="success">✓ Erledigt</Badge>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenDetails}
          className="min-h-10 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8]"
        >
          Übung öffnen
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={completed}
          className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
            completed
              ? 'cursor-not-allowed bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100'
              : 'border border-slate-200 text-slate-600 hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-300'
          }`}
        >
          {completed ? 'Erledigt' : 'Als erledigt markieren'}
        </button>
      </div>

      {replaceDialogOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${section.id}-replace-title`}
          className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
        >
          <p
            id={`${section.id}-replace-title`}
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
    </article>
  )
}

function Badge({ children, tone = 'neutral' }) {
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

export default DailyScheduleCard
