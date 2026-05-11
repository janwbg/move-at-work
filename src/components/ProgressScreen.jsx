import ProgressSummary from './ProgressSummary.jsx'

function ProgressScreen({ summary, totalToday }) {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Fortschritt
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          Jede kurze Bewegung zaehlt.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-blue-50">
          Dein Fortschritt bleibt lokal in diesem Browser gespeichert und zeigt
          dir, wie regelmaessig du heute und diese Woche in Bewegung gekommen
          bist.
        </p>
      </section>

      <ProgressSummary summary={summary} totalToday={totalToday} />

      <section className="grid gap-3 sm:grid-cols-3">
        <ProgressNote
          label="Heute erledigt"
          value={`${summary.completedToday} von ${totalToday}`}
        />
        <ProgressNote
          label="Diese Woche"
          value={`${summary.completedThisWeek} Uebungen`}
        />
        <ProgressNote label="Aktueller Streak" value={`${summary.streak} Tage`} />
      </section>
    </div>
  )
}

function ProgressNote({ label, value }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </article>
  )
}

export default ProgressScreen
