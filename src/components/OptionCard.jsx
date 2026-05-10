function OptionCard({ active, description, label, onClick, type = 'button' }) {
  const marker = active ? (type === 'checkbox' ? '✓' : '●') : ''

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-14 w-full rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
        active
          ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
          : 'border-slate-200 bg-white text-slate-900 hover:border-[#2563eb]/50 hover:bg-[#2563eb]/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-[#2563eb]/70'
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
            type === 'checkbox' ? 'rounded' : 'rounded-full'
          } ${
            active
              ? 'border-white bg-white text-[#2563eb] shadow-sm'
              : 'border-slate-300 text-transparent dark:border-slate-500'
          }`}
        >
          <span className="text-[10px] font-extrabold">{marker}</span>
        </span>
        <span>
          <span className="block font-bold leading-snug">{label}</span>
          {description && (
            <span
              className={`mt-1 block text-sm leading-6 ${
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
