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
      className={`group relative min-h-28 w-full rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
        active
          ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/60 hover:-translate-y-0.5 hover:border-[#2563eb]/50 hover:bg-[#2563eb]/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-[#2563eb]/70'
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}
    >
      <span
        className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-extrabold transition ${
          active
            ? 'border-white bg-white text-[#2563eb]'
            : 'border-slate-300 text-transparent group-hover:border-[#2563eb]/50 dark:border-slate-500'
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
              : 'bg-slate-100 text-[#2563eb] dark:bg-white/10 dark:text-slate-100'
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
                active ? 'text-blue-50' : 'text-slate-500 dark:text-slate-400'
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
