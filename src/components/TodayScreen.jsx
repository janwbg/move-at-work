import { useState } from 'react'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import MovementPlanCard from './MovementPlanCard.jsx'
import { workPhaseOptions } from '../data/profileOptions.js'

function TodayScreen({
  activeWorkPhase,
  completedIds,
  feedbackUrl,
  onComplete,
  onWorkPhaseChange,
  plan,
  progressSummary,
}) {
  const [quickHint, setQuickHint] = useState('')
  const openSections = plan.dailySchedule.filter(
    (section) => !completedIds.includes(section.id),
  )
  const completedSections = plan.dailySchedule.filter((section) =>
    completedIds.includes(section.id),
  )
  const nextSection = openSections[0]
  const openCount = openSections.length

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Heute
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl lg:text-5xl">
          Dein Tagesplan fuer mehr Bewegung.
        </h1>
        <p className="mt-5 leading-7 text-blue-50">
          {openCount === 0
            ? 'Alles erledigt fuer heute. Stark gemacht.'
            : `${openCount} von ${plan.dailySchedule.length} Impulsen sind noch offen.`}
        </p>

        <div className="mt-5 rounded-lg bg-white/10 p-4">
          <p className="text-sm font-semibold text-blue-100">Als Naechstes</p>
          <p className="mt-1 text-xl font-extrabold text-white">
            {nextSection ? nextSection.title : 'Kurze Pause geniessen'}
          </p>
          {nextSection && (
            <p className="mt-2 text-sm font-semibold leading-6 text-blue-50">
              {nextSection.timeLabel} · {nextSection.duration}
            </p>
          )}
        </div>

        <dl className="mt-5 grid gap-3">
          <SelectionRow label="Offen" value={String(openCount)} />
          <SelectionRow
            label="Erledigt"
            value={`${progressSummary.completedToday}/${plan.dailySchedule.length}`}
          />
          <SelectionRow label="Tagesstreak" value={`${progressSummary.streak} Tage`} />
        </dl>
      </aside>

      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Empfohlener Tagesrhythmus
          </p>
          <p className="mt-3 text-lg leading-8 text-slate-700 dark:text-slate-200">
            {plan.rhythm}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {plan.summary}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Was passt gerade?
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Passe den naechsten Bewegungsimpuls an deine aktuelle Situation an.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workPhaseOptions.map((phase) => {
              const isActive = activeWorkPhase === phase.id

              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => {
                    onWorkPhaseChange(phase.id)
                    setQuickHint('')
                  }}
                  className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                  }`}
                >
                  {phase.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                Tagesplan
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                Offene und erledigte Uebungen
              </h2>
            </div>
            <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {openCount} offen · {completedSections.length} erledigt
            </p>
          </div>

          {nextSection && (
            <div className="mb-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10">
              <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
                Jetzt sinnvoll
              </p>
              <p className="mt-1 font-extrabold text-slate-950 dark:text-white">
                {nextSection.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {nextSection.reason}
              </p>
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Passt gerade nicht?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <QuickAction
                    onClick={() => {
                      onWorkPhaseChange('meeting')
                      setQuickHint('Okay, die naechste Empfehlung passt sich an Meetings an.')
                    }}
                  >
                    Ich bin im Meeting
                  </QuickAction>
                  <QuickAction
                    onClick={() => {
                      onWorkPhaseChange('focus')
                      setQuickHint('Ich markiere ruhigere Impulse fuer den naechsten Schritt.')
                    }}
                  >
                    Ich brauche etwas Ruhigeres
                  </QuickAction>
                  <QuickAction
                    onClick={() =>
                      setQuickHint('Alles gut. Nimm dir den Impuls spaeter vor.')
                    }
                  >
                    Ich habe gerade keine Zeit
                  </QuickAction>
                  <QuickAction
                    onClick={() =>
                      setQuickHint(
                        'Nutze bei Bedarf den Reminder in den Einstellungen.',
                      )
                    }
                  >
                    Spaeter erinnern
                  </QuickAction>
                </div>
                {quickHint && (
                  <p className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                    {quickHint}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {plan.dailySchedule.map((section, index) => (
              <DailyScheduleCard
                completed={completedIds.includes(section.id)}
                key={section.id}
                onComplete={() => onComplete(section.id, section.title)}
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

        <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:p-5">
          Hinweis: Move at work ersetzt keine medizinische Beratung. Wenn du
          Schmerzen, Verletzungen oder gesundheitliche Einschraenkungen hast,
          passe die Bewegungen an oder frage medizinisches Fachpersonal.
        </p>

        <section className="rounded-2xl border border-dashed border-[#2563eb]/30 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10 sm:p-5">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Du testest gerade eine fruehe Version von Move at work. Dein
            Feedback hilft dabei, die App besser an echte Arbeitstage
            anzupassen.
          </p>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            Feedback geben
          </a>
        </section>
      </div>
    </div>
  )
}

function QuickAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-9 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
    >
      {children}
    </button>
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

export default TodayScreen
