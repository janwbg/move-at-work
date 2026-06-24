import { useState } from 'react'
import ReplacementReasonPicker from './ReplacementReasonPicker.jsx'

const movementTypeLabels = {
  activate: 'Aktivieren',
  breathing: 'Atmen',
  eyes: 'Augenpause',
  mini_reset: 'Mini-Reset',
  mobilize: 'Mobilisieren',
  relax: 'Entspannen',
  sit_reset: 'Sitz-Reset',
  stand: 'Stehen',
  stretch: 'Dehnen',
  walk: 'Gehen',
  walking_meeting: 'Walking-Meeting',
}

function DailyScheduleCard({
  actionLabel = 'Übung öffnen',
  canReplace = true,
  compact = false,
  completed,
  featured = false,
  initialReplaceDialogOpen = false,
  onReplaceBlocked = () => {},
  onComplete,
  onOpenDetails,
  onReplace = () => {},
  section,
}) {
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(
    initialReplaceDialogOpen && canReplace,
  )
  const movementLabel =
    movementTypeLabels[section.movementType] ?? section.movementType

  if (completed && compact) {
    return (
      <CompletedScheduleRow
        movementLabel={movementLabel}
        onOpenDetails={onOpenDetails}
        section={section}
      />
    )
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
  }

  const isCompactOpen = compact && !featured
  const openClass = featured
    ? 'border-[#2563eb]/30 bg-white shadow-md shadow-[#2563eb]/10 dark:border-blue-300/20 dark:bg-white/[0.06]'
    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]'

  return (
    <article
      className={`relative rounded-lg border shadow-sm transition ${
        isCompactOpen ? 'p-3' : 'p-4 sm:p-5'
      } ${completed ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/10' : openClass}`}
    >
      <div
        className={`flex flex-col gap-3 ${
          isCompactOpen ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:flex-row sm:items-start sm:justify-between'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-normal text-[#2563eb]">
                  {section.timeLabel}
                </p>
                {featured && !completed && (
                  <span className="rounded-full bg-[#2563eb]/10 px-2.5 py-1 text-xs font-extrabold text-[#1d4ed8] dark:bg-blue-300/10 dark:text-blue-100">
                    Jetzt passend
                  </span>
                )}
              </div>
              <h3
                className={`mt-0.5 font-extrabold tracking-normal ${
                  completed
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-950 dark:text-white'
                } ${featured ? 'text-xl' : 'text-base'}`}
              >
                {section.title}
              </h3>
              {isCompactOpen ? (
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {section.duration} · {movementLabel}
                </p>
              ) : (
                section.reason && (
                  <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                    {section.reason}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {!isCompactOpen && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge>{section.duration}</Badge>
            <Badge>{movementLabel}</Badge>
            {completed && <Badge tone="success">✓ Erledigt</Badge>}
          </div>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 ${isCompactOpen ? 'mt-3 sm:mt-0 sm:justify-end' : 'mt-4'}`}>
        <button
          type="button"
          onClick={onOpenDetails}
          className={`rounded-full bg-[#2563eb] text-sm font-bold text-white shadow-md shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] ${
            featured ? 'min-h-11 px-5 py-3' : 'min-h-8 px-3 py-1.5'
          }`}
        >
          {isCompactOpen ? 'Öffnen' : actionLabel}
        </button>
        {!completed && (
          <button
            type="button"
            aria-label="Andere Empfehlung wählen"
            title="Andere Empfehlung wählen"
            onClick={openReplacementDialog}
            className={`${isCompactOpen ? 'min-h-8 w-8 text-base' : 'min-h-10 w-10 text-lg'} flex items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-300`}
          >
            ↻
          </button>
        )}
        <button
          type="button"
          onClick={onComplete}
          disabled={completed}
          className={`rounded-full border border-slate-200 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-300 ${
            isCompactOpen ? 'min-h-8 px-3 py-1.5' : 'min-h-10 px-4 py-2'
          }`}
        >
          {completed ? 'Erledigt' : 'Erledigt'}
        </button>
      </div>

      {!completed && canReplace && replaceDialogOpen && (
        <ReplacementReasonPicker
          idPrefix={`${section.id}-card`}
          onCancel={() => setReplaceDialogOpen(false)}
          onSelectReason={submitReplacement}
        />
      )}
    </article>
  )
}

function CompletedScheduleRow({ movementLabel, onOpenDetails, section }) {
  return (
    <button
      type="button"
      aria-label={`Erledigte Übung öffnen: ${section.title}`}
      onClick={onOpenDetails}
      className="group w-full rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-[#2563eb]/30 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-extrabold text-slate-600 dark:bg-white/10 dark:text-slate-300"
        >
          ✓
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-slate-700 dark:text-slate-200">
            {section.title}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
            {section.timeLabel} · {section.duration} · {movementLabel}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
          Erledigt
        </span>
      </span>
    </button>
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
