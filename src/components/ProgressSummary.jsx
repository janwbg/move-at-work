function ProgressSummary({ feedbackSummary, summary, totalToday }) {
  const safeTotal = Math.max(totalToday, 0)
  const completedToday =
    safeTotal > 0 ? Math.min(summary.completedToday, safeTotal) : 0
  const todayStatus = summary.todayStatus ?? {
    id: completedToday > 0 ? 'held' : 'open',
    label: completedToday > 0 ? 'Routine gehalten' : 'Offen',
  }
  const routineWeek = summary.routineWeek ?? {
    completedDays: 0,
    plannedDays: 0,
  }
  const routineCalendar = Array.isArray(summary.routineCalendar)
    ? summary.routineCalendar
    : []
  const motivationMessage = getProgressMotivationMessage({
    feedbackSummary,
    summary,
  })

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing
            completedToday={completedToday}
            status={todayStatus}
            totalToday={safeTotal}
          />

          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
              Heute erledigt
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              {safeTotal > 0
                ? `${completedToday} von ${safeTotal} Microbreaks erledigt`
                : 'Noch kein Tagesplan verfügbar'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getTodayStatusMessage(todayStatus)}
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        <ProgressItem
          label="Aktive Woche"
          value={`${routineWeek.completedDays} von ${routineWeek.plannedDays} Tagen`}
          helper={`Diese Woche hast du ${routineWeek.completedDays} von ${routineWeek.plannedDays} aktiven Arbeits-/Lerntagen geschafft.`}
        />
        <ProgressItem
          label="Arbeits-/Lernroutine"
          value={`${summary.streak} ${summary.streak === 1 ? 'Arbeitstag' : 'Arbeitstage'} in Folge`}
          helper="Pausentage brechen deine Routine nicht."
        />
      </div>

      <RoutineCalendar days={routineCalendar} />

      <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
        {motivationMessage}
      </p>
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

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Routine-Kalender
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            Letzte 28 Tage
          </h3>
        </div>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Nur aktive Arbeits-/Lerntage zählen. Pausentage bleiben neutral.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((weekday) => (
          <div
            className="pb-1 text-center text-[11px] font-extrabold text-slate-400 dark:text-slate-500"
            data-routine-weekday={weekday}
            key={weekday}
          >
            {weekday}
          </div>
        ))}
        {leadingPlaceholders.map((_, index) => (
          <div
            aria-hidden="true"
            className="min-h-8"
            data-routine-calendar-placeholder=""
            key={`placeholder-${index}`}
          />
        ))}
        {days.map((day) => (
          <div
            aria-label={`${day.isToday ? 'Heute, ' : ''}${day.date}: ${getCalendarStatusLabel(day.status)}`}
            className={`relative flex aspect-square min-h-8 flex-col items-center justify-center rounded-md border text-xs font-extrabold leading-none ${getCalendarStatusClass(day.status)} ${day.isToday ? 'ring-2 ring-[#2563eb]/35 ring-offset-1 ring-offset-white dark:ring-offset-[#1b1b1b]' : ''}`}
            data-routine-calendar-day={day.date}
            data-routine-calendar-today={day.isToday ? 'true' : undefined}
            data-routine-status={day.status.id}
            key={day.date}
            title={`${day.isToday ? 'Heute, ' : ''}${day.date}: ${getCalendarStatusLabel(day.status)}`}
          >
            <span>{day.dayLabel}</span>
            {day.isToday && (
              <span className="mt-0.5 text-[8px] font-extrabold uppercase tracking-normal">
                Heute
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {[
          ['complete', 'Komplett'],
          ['strong', 'Stark'],
          ['held', 'Routine'],
          ['pause', 'Pause'],
          ['neutral', 'Neutral'],
          ['missed', 'Nicht geschafft'],
        ].map(([statusId, label]) => (
          <span key={statusId} className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-sm border ${getCalendarStatusClass({ id: statusId })}`}
            />
            {label}
          </span>
        ))}
      </div>
    </article>
  )
}

function getTodayStatusMessage(todayStatus) {
  if (todayStatus.id === 'pause') {
    return 'Heute ist Pausentag. Deine Routine bleibt erhalten.'
  }

  if (todayStatus.id === 'complete') {
    return 'Kompletter Tag.'
  }

  if (todayStatus.id === 'strong') {
    return 'Starker Tag.'
  }

  if (todayStatus.id === 'held') {
    return 'Routine gehalten.'
  }

  return 'Ein kurzer Reset reicht, um deine Routine heute zu halten.'
}

function getProgressMotivationMessage({ feedbackSummary, summary }) {
  const completedThisWeek = Math.max(summary?.completedThisWeek ?? 0, 0)
  const positiveBenefitCount = Math.max(
    feedbackSummary?.positiveBenefitCount ?? 0,
    0,
  )

  if (positiveBenefitCount > 0) {
    return `${completedThisWeek > 0 ? `Diese Woche hast du ${completedThisWeek} kurze Resets abgeschlossen. ` : ''}${positiveBenefitCount}x hast du dich danach wacher, entspannter, fokussierter oder lockerer gefühlt.`
  }

  if (completedThisWeek > 0) {
    return `Diese Woche hast du ${completedThisWeek} kurze Resets abgeschlossen. Jeder kurze Reset zählt - auch ohne perfekte Routine.`
  }

  return 'Jeder kurze Reset zählt - auch ohne perfekte Routine.'
}

function ProgressItem({ helper, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
      {helper && (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {helper}
        </p>
      )}
    </div>
  )
}

export function ProgressRing({
  completedToday,
  totalToday,
  compact = false,
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
  const sizeClass = compact ? 'h-20 w-20' : 'h-36 w-36'
  const valueClass = compact ? 'text-lg' : 'text-2xl'

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center ${isCompleteDay ? 'rounded-full bg-[#2563eb]/5 ring-4 ring-[#2563eb]/10 motion-safe:animate-pulse' : ''}`}
      aria-label={`${safeCompleted} von ${safeTotal} Microbreaks erledigt`}
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
          className={`${isCompleteDay ? 'text-emerald-500' : 'text-[#2563eb]'} transition-all`}
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
        {!(compact && isCompleteDay) && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isCompleteDay ? 'Kompletter Tag' : getRingStatusLabel(statusId, percentage)}
          </p>
        )}
      </div>
    </div>
  )
}

function getCalendarStatusLabel(status) {
  const labels = {
    complete: 'Kompletter Tag',
    held: 'Routine',
    missed: 'Nicht geschafft',
    neutral: 'Neutraler Tag',
    open: 'Offen',
    pause: 'Pausentag',
    strong: 'Starker Tag',
  }

  return labels[status?.id] ?? 'Neutraler Tag'
}

function getCalendarStatusClass(status) {
  const classes = {
    complete:
      'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
    held: 'border-[#2563eb]/30 bg-[#2563eb]/10 text-[#1d4ed8] dark:text-blue-100',
    missed:
      'border-slate-300 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
    neutral:
      'border-transparent bg-slate-50 text-slate-400 dark:bg-white/[0.03] dark:text-slate-500',
    open: 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
    pause:
      'border-dashed border-slate-300 bg-white text-slate-500 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-400',
    strong:
      'border-[#2563eb] bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/20',
  }

  return classes[status?.id] ?? classes.neutral
}

function getRingStatusLabel(statusId, percentage) {
  const labels = {
    held: 'Routine',
    open: 'Start',
    pause: 'Pause',
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
