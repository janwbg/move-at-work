function StartScreen({ onStart }) {
  return (
    <section className="w-full max-w-2xl text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2563eb] text-3xl font-extrabold text-white shadow-lg shadow-[#2563eb]/25">
        M
      </div>

      <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-6xl">
        Move at work
      </h1>
      <p className="mt-4 text-xl font-semibold text-[#2563eb]">
        Dein smarter Bewegungsplan für den Arbeitsalltag
      </p>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
        Die App hilft dir, passende Bewegungsimpulse auf Basis deines
        Arbeitsplatz-Setups, Ziels und Fitnesslevels zu erhalten.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-9 rounded-full bg-[#2563eb] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#2563eb]/25 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
      >
        Los geht`s
      </button>
    </section>
  )
}

export default StartScreen
