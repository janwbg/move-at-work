import { useMemo, useState } from 'react'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import MovementPlanCard from './MovementPlanCard.jsx'
import ProfileSettings from './ProfileSettings.jsx'
import ProgressSummary from './ProgressSummary.jsx'
import ReminderSettings from './ReminderSettings.jsx'
import {
  calculateProgressSummary,
  getCompletedIdsForDate,
  loadProgress,
  recordCompletion,
  saveProgress,
} from '../utils/progressStorage.js'

function ResultScreen({ answers, onChangeAnswers, plan }) {
  const [progress, setProgress] = useState(() => loadProgress())
  const completedIds = useMemo(() => getCompletedIdsForDate(progress), [progress])
  const progressSummary = useMemo(
    () => calculateProgressSummary(progress),
    [progress],
  )

  function handleComplete(exerciseId) {
    const nextProgress = recordCompletion(progress, exerciseId)
    setProgress(nextProgress)
    saveProgress(nextProgress)
  }

  return (
    <section className="w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
            Dein Plan
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl lg:text-5xl">
            Hier ist dein flexibler Bewegungsplan.
          </h1>
          <p className="mt-5 leading-7 text-blue-50">
            Du musst ihn nicht exakt abarbeiten – nutze die Impulse so, wie sie
            in deinen Arbeitsalltag passen.
          </p>
          <p className="mt-3 rounded-lg bg-white/10 p-4 text-sm font-semibold leading-6 text-blue-50">
            Dein Plan basiert auf deinem Setup, deinem Ziel, deinem
            Fitnesslevel und deinem typischen Arbeitstag.
          </p>

          <dl className="mt-7 grid gap-3">
            <SelectionRow label="Ziel" value={answers.goal} />
            <SelectionRow label="Setup" value={answers.setup.join(', ')} />
            <SelectionRow label="Fitnesslevel" value={answers.fitnessLevel} />
            <SelectionRow label="Typischer Arbeitstag" value={answers.situation} />
          </dl>
        </aside>

        <div className="space-y-5">
          <ProgressSummary
            summary={progressSummary}
            totalToday={plan.dailySchedule.length}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
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
                  completed={completedIds.includes(section.id)}
                  key={section.id}
                  onComplete={() => handleComplete(section.id)}
                  section={section}
                  stepNumber={index + 1}
                />
              ))}
            </div>
          </section>

          <ProfileSettings answers={answers} onChange={onChangeAnswers} />

          <ReminderSettings />

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
            Schmerzen, Verletzungen oder gesundheitliche Einschränkungen hast,
            passe die Bewegungen an oder frage medizinisches Fachpersonal.
          </p>

          <section className="rounded-2xl border border-dashed border-[#2563eb]/30 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10 sm:p-5">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Du testest gerade eine frühe Version von Move at work. Dein
              Feedback hilft dabei, die Empfehlungen besser zu machen.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 min-h-11 rounded-full bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500 disabled:cursor-not-allowed dark:bg-white/10 dark:text-slate-400"
            >
              Feedback-Link folgt
            </button>
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
