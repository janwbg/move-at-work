function ProgressSummary({ summary, totalToday }) {
  const safeTotal = Math.max(totalToday, 0)
  const completedToday =
    safeTotal > 0 ? Math.min(summary.completedToday, safeTotal) : 0

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing completedToday={completedToday} totalToday={safeTotal} />

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
              {completedToday > 0
                ? `Du hast heute schon ${completedToday} Sitzphase${completedToday === 1 ? '' : 'n'} unterbrochen.`
                : 'Jede kurze Bewegung zählt, sobald dein erster Impuls erledigt ist.'}
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        <ProgressItem
          label="Diese Arbeitswoche"
          value={String(summary.completedThisWeek)}
        />
        <ProgressItem
          label="Arbeitsstreak"
          value={`${summary.streak} ${summary.streak === 1 ? 'Arbeitstag' : 'Arbeitstage'} in Folge`}
          helper="Wochenenden unterbrechen deine Streak nicht."
        />
      </div>
    </section>
  )
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

export function ProgressRing({ completedToday, totalToday, compact = false }) {
  const safeTotal = Math.max(totalToday, 0)
  const safeCompleted =
    safeTotal > 0 ? Math.min(Math.max(completedToday, 0), safeTotal) : 0
  const progress = safeTotal > 0 ? safeCompleted / safeTotal : 0
  const percentage = Math.round(progress * 100)
  const circumference = 2 * Math.PI * 44
  const strokeOffset = circumference * (1 - progress)
  const sizeClass = compact ? 'h-28 w-28' : 'h-36 w-36'
  const valueClass = compact ? 'text-xl' : 'text-2xl'

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center`}
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
          className="text-[#2563eb] transition-all"
        />
      </svg>
      <div className="absolute text-center">
        <p className={`${valueClass} font-extrabold text-slate-950 dark:text-white`}>
          {safeTotal > 0 ? `${safeCompleted}/${safeTotal}` : '0/0'}
        </p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {percentage}%
        </p>
      </div>
    </div>
  )
}

export default ProgressSummary
