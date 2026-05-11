import ProgressSummary from './ProgressSummary.jsx'

function ProgressScreen({ summary, totalToday }) {
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
          dir, wie regelmäßig du heute und diese Woche in Bewegung gekommen
          bist.
        </p>
      </section>

      <ProgressSummary summary={summary} totalToday={totalToday} />
    </div>
  )
}

export default ProgressScreen
