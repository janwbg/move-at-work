function MovementPlanCard({ movement }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-lg font-extrabold tracking-normal text-slate-950 dark:text-white">
          {movement.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="w-fit rounded-full bg-[#2563eb]/10 px-3 py-1 text-sm font-bold text-[#2563eb]">
            {movement.duration}
          </span>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {movement.intensity}
          </span>
        </div>
      </div>
      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
        {movement.description}
      </p>
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Passendes Setup: {movement.displaySetup}
      </p>
    </article>
  )
}

export default MovementPlanCard
