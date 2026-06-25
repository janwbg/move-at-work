function ProgressSummary({ summary = {}, totalToday = 0 }) {
  const safeTotal = Math.max(totalToday, 0)
  const completedToday =
    safeTotal > 0 ? Math.min(Math.max(summary.completedToday ?? 0, 0), safeTotal) : 0
  const completedThisWeek = Math.max(summary.completedThisWeek ?? 0, 0)
  const streak = Math.max(summary.streak ?? 0, 0)
  const todayStatus = summary.todayStatus ?? {
    id: completedToday > 0 ? 'held' : 'open',
    label: completedToday > 0 ? 'Routine gestartet' : 'Offen',
  }
  const routineCalendar = Array.isArray(summary.routineCalendar)
    ? summary.routineCalendar
    : []

  return (
    <section className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex min-h-32 flex-col items-center justify-center gap-3">
            <ProgressRing
              completedToday={completedToday}
              showStatusLabel={false}
              size="medium"
              status={todayStatus}
              totalToday={safeTotal}
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">
                Heute erledigt
              </p>
              <p className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">
                {getTodayKpiLabel(completedToday)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex min-h-32 flex-col items-center justify-center gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">
                Aktive Woche
              </p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-teal-700 dark:text-teal-200">
                {completedThisWeek}
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-600 dark:text-slate-300">
                Impulse
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex min-h-32 flex-col items-center justify-center gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">
                Arbeits-/Lernroutine
              </p>
            </div>
            <p
              aria-label={`${streak} ${streak === 1 ? 'aktiver Tag' : 'aktive Tage'} in Folge`}
              className="text-4xl font-extrabold leading-none text-emerald-700 dark:text-emerald-100"
            >
              {streak}
            </p>
            <div>
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                Arbeitsstreak
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Freie Tage bleiben neutral.
              </p>
            </div>
          </div>
        </article>
      </div>

      <RoutineCalendar days={routineCalendar} />
    </section>
  )
}

function RoutineCalendar({ days }) {
  if (!days.length) {
    return null
  }

  const leadingPlaceholders = Array.from({
    length: getMondayStartColumn(days[0]?.weekday),
  })
  const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const legendItems = [
    ['complete', 'Komplett'],
    ['active', 'Aktiv'],
    ['open', 'Offen'],
    ['neutral', 'Neutral'],
  ]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
            Aktive Woche
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            Freie Tage und Pausentage bleiben neutral.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          {legendItems.map(([stateId, label]) => (
            <span
              key={stateId}
              className="inline-flex items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${getCalendarLegendDotClass(stateId)}`}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekdayLabels.map((weekday) => (
          <div
            className="pb-0.5 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500"
            data-routine-weekday={weekday}
            key={weekday}
          >
            {weekday}
          </div>
        ))}
        {leadingPlaceholders.map((_, index) => (
          <div
            aria-hidden="true"
            className="min-h-7"
            data-routine-calendar-placeholder=""
            key={`placeholder-${index}`}
          />
        ))}
        {days.map((day) => {
          const stateId = getCalendarStateId(day.status)
          const stateLabel = getCalendarStateLabel(stateId)

          return (
            <div
              aria-label={`${day.isToday ? 'Heute, ' : ''}${day.date}: ${stateLabel}`}
              className={`relative flex aspect-square min-h-7 flex-col items-center justify-center rounded-md border text-[11px] font-extrabold leading-none ${getCalendarStatusClass(stateId)} ${day.isToday ? 'after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-teal-700/45 after:ring-offset-1 after:ring-offset-white dark:after:ring-offset-[#0f1413]' : ''}`}
              data-routine-calendar-day={day.date}
              data-routine-calendar-today={day.isToday ? 'true' : undefined}
              data-routine-source-status={day.status?.id}
              data-routine-status={stateId}
              key={day.date}
              title={`${day.isToday ? 'Heute, ' : ''}${day.date}: ${stateLabel}`}
            >
              <span>{day.dayLabel}</span>
              {day.isToday && (
                <span className="mt-0.5 text-[7px] font-extrabold uppercase tracking-normal">
                  Heute
                </span>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

function getTodayKpiLabel(completedToday) {
  if (completedToday >= 5) {
    return 'Kompletter Tag'
  }

  if (completedToday >= 3) {
    return 'Starker Tag'
  }

  if (completedToday >= 1) {
    return 'Routine gehalten'
  }

  return 'Offen'
}

export function ProgressRing({
  completedToday,
  totalToday,
  compact = false,
  showStatusLabel = true,
  size,
  status,
}) {
  const safeTotal = Math.max(totalToday, 0)
  const safeCompleted =
    safeTotal > 0 ? Math.min(Math.max(completedToday, 0), safeTotal) : 0
  const progress = safeTotal > 0 ? safeCompleted / safeTotal : 0
  const percentage = Math.round(progress * 100)
  const statusId = status?.id ?? getStatusIdFromProgress(safeCompleted)
  const isCompleteDay = statusId === 'complete'
  const circumference = 2 * Math.PI * 44
  const strokeOffset = circumference * (1 - progress)
  const ringSize = size ?? (compact ? 'compact' : 'regular')
  const sizeClasses = {
    compact: 'h-20 w-20',
    medium: 'h-24 w-24',
    regular: 'h-36 w-36',
  }
  const valueClasses = {
    compact: 'text-lg',
    medium: 'text-xl',
    regular: 'text-2xl',
  }
  const sizeClass = sizeClasses[ringSize] ?? sizeClasses.regular
  const valueClass = valueClasses[ringSize] ?? valueClasses.regular

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center ${isCompleteDay ? 'rounded-full bg-emerald-50 ring-4 ring-emerald-100 dark:bg-emerald-400/10 dark:ring-emerald-400/10' : ''}`}
      aria-label={`${safeCompleted} von ${safeTotal} Impulse erledigt`}
    >
      <svg className={`${sizeClass} -rotate-90`} viewBox="0 0 104 104">
        <circle
          cx="52"
          cy="52"
          fill="none"
          r="44"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100 dark:text-white/10"
        />
        <circle
          cx="52"
          cy="52"
          fill="none"
          r="44"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="10"
          className={`${isCompleteDay ? 'text-emerald-500 dark:text-emerald-300' : 'text-teal-700 dark:text-teal-300'} transition-all`}
        />
      </svg>
      <div className="absolute text-center">
        {isCompleteDay && (
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-300">
            ✓
          </p>
        )}
        <p className={`${valueClass} font-extrabold text-slate-950 dark:text-white`}>
          {safeTotal > 0 ? `${safeCompleted}/${safeTotal}` : '0/0'}
        </p>
        {showStatusLabel && !(compact && isCompleteDay) && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isCompleteDay ? 'Kompletter Tag' : getRingStatusLabel(statusId, percentage)}
          </p>
        )}
      </div>
    </div>
  )
}

function getCalendarStateId(status) {
  if (status?.id === 'complete') {
    return 'complete'
  }

  if (['held', 'strong'].includes(status?.id)) {
    return 'active'
  }

  if (['missed', 'open'].includes(status?.id)) {
    return 'open'
  }

  return 'neutral'
}

function getCalendarStateLabel(stateId) {
  const labels = {
    active: 'Aktiv',
    complete: 'Komplett',
    neutral: 'Neutral',
    open: 'Offen',
  }

  return labels[stateId] ?? labels.neutral
}

function getCalendarLegendDotClass(stateId) {
  const classes = {
    active: 'bg-teal-700',
    complete: 'bg-emerald-500',
    neutral: 'bg-slate-300 dark:bg-slate-600',
    open: 'bg-white ring-1 ring-slate-300 dark:bg-white/10 dark:ring-white/15',
  }

  return classes[stateId] ?? classes.neutral
}

function getCalendarStatusClass(stateId) {
  const classes = {
    active:
      'border-teal-700/30 bg-teal-50 text-teal-700 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100',
    complete:
      'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
    neutral:
      'border-transparent bg-slate-50 text-slate-400 dark:bg-white/[0.03] dark:text-slate-500',
    open: 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
  }

  return classes[stateId] ?? classes.neutral
}

function getRingStatusLabel(statusId, percentage) {
  const labels = {
    held: 'Routine gehalten',
    open: 'Offen',
    pause: 'Pausentag',
    strong: 'Starker Tag',
  }

  return labels[statusId] ?? `${percentage}%`
}

function getStatusIdFromProgress(completedToday) {
  if (completedToday >= 5) {
    return 'complete'
  }

  if (completedToday >= 3) {
    return 'strong'
  }

  if (completedToday >= 1) {
    return 'held'
  }

  return 'open'
}

function getMondayStartColumn(weekday = 1) {
  return weekday === 0 ? 6 : Math.max(weekday - 1, 0)
}

export default ProgressSummary
