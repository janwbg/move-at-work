import DailyScheduleCard from './DailyScheduleCard.jsx'
import MovementPlanCard from './MovementPlanCard.jsx'

function ResultScreen({ answers, onRestart, plan }) {
  return (
    <section className="w-full max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
            Dein Plan
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
            Bereit für mehr Bewegung im Arbeitstag.
          </h1>
          <p className="mt-5 leading-7 text-blue-50">{plan.summary}</p>
          <p className="mt-3 rounded-lg bg-white/10 p-4 text-sm font-semibold leading-6 text-blue-50">
            Dein Plan basiert auf deinem Setup, deinem Ziel, deinem
            Fitnesslevel und deiner heutigen Arbeitssituation.
          </p>

          <dl className="mt-7 grid gap-3">
            <SelectionRow label="Ziel" value={answers.goal} />
            <SelectionRow label="Setup" value={answers.setup.join(', ')} />
            <SelectionRow label="Fitnesslevel" value={answers.fitnessLevel} />
            <SelectionRow label="Arbeitssituation" value={answers.situation} />
          </dl>

          <button
            type="button"
            onClick={onRestart}
            className="mt-8 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#2563eb] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Onboarding neu starten
          </button>
        </aside>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
              Empfohlener Tagesrhythmus
            </p>
            <p className="mt-3 text-lg leading-8 text-slate-700 dark:text-slate-200">
              {plan.rhythm}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                Dein Tagesplan
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                Flexible Impulse für deinen Arbeitstag
              </h2>
            </div>
            <div className="grid gap-4">
              {plan.dailySchedule.map((section, index) => (
                <DailyScheduleCard
                  key={section.id}
                  section={section}
                  stepNumber={index + 1}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            <h2 className="mb-4 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              Weitere passende Impulse
            </h2>
            <div className="grid gap-4">
              {plan.movements.map((movement) => (
                <MovementPlanCard key={movement.id} movement={movement} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function SelectionRow({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <dt className="text-sm font-semibold text-blue-100">{label}</dt>
      <dd className="mt-1 font-bold text-white">{value}</dd>
    </div>
  )
}

export default ResultScreen
