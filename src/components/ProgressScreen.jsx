import ProgressSummary from './ProgressSummary.jsx'

function ProgressScreen({ summary, totalToday }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="px-1">
        <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Fortschritt
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          Ein ruhiger Blick auf deine Arbeits- und Lernroutine.
        </p>
      </header>

      <ProgressSummary summary={summary} totalToday={totalToday} />
    </div>
  )
}

export default ProgressScreen
