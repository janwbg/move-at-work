function AppHeader({ isDark, showReset, onReset, onToggleTheme }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Move at work
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bewegungsimpulse für den Arbeitstag
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={isDark}
          onClick={onToggleTheme}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2563eb]/40 hover:text-[#2563eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {isDark ? 'Hell' : 'Dunkel'}
        </button>

        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2563eb]/40 hover:text-[#2563eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            Neu starten
          </button>
        )}
      </div>
    </header>
  )
}

export default AppHeader
