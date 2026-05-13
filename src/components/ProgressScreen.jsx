import ProgressSummary from './ProgressSummary.jsx'

function ProgressScreen({ feedbackSummary, summary, totalToday }) {
  const safeFeedbackSummary = {
    total: feedbackSummary?.total ?? 0,
    fit: feedbackSummary?.fit ?? 0,
    notFit: feedbackSummary?.notFit ?? 0,
    mostCommonReason: feedbackSummary?.mostCommonReason ?? '',
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Fortschritt
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          Jede kurze Bewegung zählt.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-blue-50">
          Dein Fortschritt bleibt lokal in diesem Browser gespeichert und zeigt
          dir, wie regelmäßig du im Arbeitsalltag kurze Sitzphasen
          unterbrichst. Wochenenden unterbrechen deine Streak nicht.
        </p>
      </section>

      <ProgressSummary summary={summary} totalToday={totalToday} />

      <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Empfehlungsfeedback
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <FeedbackMetric
            label="Gespeichert"
            value={String(safeFeedbackSummary.total)}
          />
          <FeedbackMetric
            label="Hat gepasst"
            value={String(safeFeedbackSummary.fit)}
          />
          <FeedbackMetric
            label="Eher nicht"
            value={String(safeFeedbackSummary.notFit)}
          />
        </div>
        {safeFeedbackSummary.mostCommonReason && (
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            Häufigster Grund: {safeFeedbackSummary.mostCommonReason}
          </p>
        )}
      </section>
    </div>
  )
}

function FeedbackMetric({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  )
}

export default ProgressScreen
