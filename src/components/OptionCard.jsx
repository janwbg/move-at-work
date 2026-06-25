function OptionCard({
  active,
  description,
  disabled = false,
  icon,
  label,
  onClick,
  type = 'button',
}) {
  const marker = type === 'checkbox' ? '✓' : '●'

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`group relative min-h-28 w-full rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
        active
          ? 'border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-700/20'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/50 hover:-translate-y-0.5 hover:border-teal-700/50 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-teal-300/50'
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}
    >
      <span
        className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-extrabold transition ${
          active
            ? 'border-white bg-white text-teal-700'
            : 'border-slate-300 text-transparent group-hover:border-teal-700/50 dark:border-slate-500'
        }`}
        aria-hidden="true"
      >
        {active ? marker : ''}
      </span>

      <span className="flex flex-col gap-4">
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
            active
              ? 'bg-white/15 text-white'
              : 'bg-slate-100 text-teal-700 dark:bg-white/10 dark:text-teal-200'
          }`}
        >
          {icon ?? '•'}
        </span>
        <span>
          <span className="block pr-8 text-base font-extrabold leading-snug">
            {label}
          </span>
          {description && (
            <span
              className={`mt-2 block text-sm leading-6 ${
                active ? 'text-teal-50' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {description}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

export default OptionCard
