function ProgressSummary({ summary, totalToday }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
        Fortschritt
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ProgressItem
          label="Heute erledigt"
          value={`${summary.completedToday}/${totalToday}`}
        />
        <ProgressItem
          label="Diese Woche"
          value={String(summary.completedThisWeek)}
        />
        <ProgressItem label="Tagesstreak" value={`${summary.streak} Tage`} />
      </div>
    </section>
  )
}

function ProgressItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  )
}

export default ProgressSummary
