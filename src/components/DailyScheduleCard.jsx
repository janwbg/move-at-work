function DailyScheduleCard({ section, stepNumber }) {
  return (
    <article className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-sm font-extrabold text-white">
            {stepNumber}
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
              {section.timeLabel}
            </p>
            <h3 className="mt-1 text-lg font-extrabold tracking-normal text-slate-950 dark:text-white">
              {section.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="w-fit rounded-full bg-[#2563eb]/10 px-3 py-1 text-sm font-bold text-[#2563eb]">
            {section.duration}
          </span>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {section.intensity}
          </span>
        </div>
      </div>

      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
        {section.description}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
          Setup: {section.setup}
        </p>
        <p className="rounded-lg bg-[#2563eb]/10 p-3 text-sm font-semibold leading-6 text-slate-700 dark:text-blue-50">
          Warum: {section.reason}
        </p>
      </div>
    </article>
  )
}

export default DailyScheduleCard
