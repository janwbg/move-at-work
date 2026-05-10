const benefits = [
  'Weniger langes Sitzen',
  'Mehr Bewegung ohne Trainingskleidung',
  'Passend zu deinem Arbeitsalltag',
]

function StartScreen({ onStart }) {
  return (
    <section className="w-full max-w-3xl text-center">
      <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563eb] text-2xl font-extrabold text-white shadow-lg shadow-[#2563eb]/25 sm:h-20 sm:w-20 sm:text-3xl">
        M
      </div>

      <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
        Move at work
      </p>
      <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-6xl">
        Dein smarter Bewegungsplan für den Arbeitsalltag
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
        Move at work hilft dir, mehr Bewegung in deinen Arbeitstag zu bringen –
        passend zu deinem Ziel, deinem Arbeitsplatz und deinem Alltag.
      </p>

      <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb]/10 text-sm font-extrabold text-[#2563eb]">
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
        className="mt-9 w-full rounded-full bg-[#2563eb] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#2563eb]/25 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] sm:w-auto"
      >
        Bewegungsplan erstellen
      </button>
    </section>
  )
}

export default StartScreen
