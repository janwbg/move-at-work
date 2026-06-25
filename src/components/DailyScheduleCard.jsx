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
  isReplacementOpen = false,
  onCloseReplacement = () => {},
  onReplaceBlocked = () => {},
  onComplete,
  onOpenDetails,
  onReplace = () => {},
  onToggleReplacement = () => {},
  paused = false,
  section,
}) {
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
      onCloseReplacement()
      onReplaceBlocked()
      return
    }

    onToggleReplacement()
  }

  function submitReplacement(reason) {
    if (completed) {
      return
    }

    onReplace(reason)
    onCloseReplacement()
  }

  const isCompactOpen = compact && !featured
  const openClass = featured
    ? 'border-teal-700/30 bg-white shadow-md shadow-teal-700/10 dark:border-teal-300/20 dark:bg-white/[0.07]'
    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.05]'

  return (
    <article
      className={`relative rounded-lg border shadow-sm transition ${
        isCompactOpen ? 'p-3' : 'p-4 sm:p-5'
      } ${paused && !completed ? 'border-slate-200 bg-slate-50 opacity-75 dark:border-white/10 dark:bg-white/[0.03]' : completed ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/10' : openClass}`}
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
                <p className="text-xs font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
                  {section.timeLabel}
                </p>
                {featured && !completed && (
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-extrabold text-teal-700 dark:bg-teal-300/10 dark:text-teal-100">
                    Nächster Impuls
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

      {!paused && (
        <div className={`flex flex-wrap gap-2 ${isCompactOpen ? 'mt-3 sm:mt-0 sm:justify-end' : 'mt-4'}`}>
          <button
            type="button"
            onClick={onOpenDetails}
            className={`rounded-full bg-teal-700 text-sm font-bold text-white shadow-md shadow-teal-700/15 transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              featured ? 'min-h-11 px-5 py-3' : 'min-h-8 px-3 py-1.5'
            }`}
          >
            {actionLabel}
          </button>
          {!completed && (
            <button
              type="button"
              aria-label="Andere Empfehlung"
              title="Andere Empfehlung"
              onClick={openReplacementDialog}
              className={`${isCompactOpen ? 'min-h-8 w-8' : 'min-h-10 w-10'} flex items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-teal-700/40 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-white/10 dark:text-slate-300`}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ⟳
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onComplete}
            disabled={completed}
            className={`rounded-full border border-slate-200 text-sm font-bold text-slate-600 transition hover:border-emerald-500/40 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700 dark:border-white/10 dark:text-slate-300 dark:disabled:border-emerald-400/20 dark:disabled:bg-emerald-400/10 dark:disabled:text-emerald-100 ${
              isCompactOpen ? 'min-h-8 px-3 py-1.5' : 'min-h-10 px-4 py-2'
            }`}
          >
            {completed ? 'Erledigt' : 'Erledigt'}
          </button>
        </div>
      )}

      {!paused && !completed && canReplace && isReplacementOpen && (
        <ReplacementReasonPicker
          idPrefix={`${section.id}-card`}
          onCancel={onCloseReplacement}
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
      className="group w-full rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-left transition hover:border-teal-700/30 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100"
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
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-white/10 dark:text-emerald-100">
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
