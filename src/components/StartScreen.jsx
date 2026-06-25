const benefits = [
  'Kurze Impulse statt langer Unterbrechung',
  'Ohne Sportkleidung oder Extra-Planung',
  'Passend zu Büro, Homeoffice und Lernen',
]

function StartScreen({ onStart }) {
  return (
    <section className="w-full max-w-3xl text-center">
      <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-2xl font-extrabold text-white shadow-lg shadow-teal-700/20 sm:h-20 sm:w-20 sm:text-3xl">
        M
      </div>

      <p className="text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
        Move at work
      </p>
      <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-6xl">
        Sitzphasen unterbrechen, ohne aus dem Arbeitstag rauszukommen.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
        Kleine Bewegungsimpulse für deinen Arbeits- oder Lerntag. Ruhig,
        passend und ohne daraus ein zusätzliches To-do zu machen.
      </p>

      <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]"
          >
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              ✓
            </span>
            <p className="font-bold leading-snug text-slate-900 dark:text-white">
              {benefit}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-9 w-full rounded-full bg-teal-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
      >
        Bewegungsplan erstellen
      </button>
    </section>
  )
}

export default StartScreen
