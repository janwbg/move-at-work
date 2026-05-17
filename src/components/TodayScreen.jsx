import { useState } from 'react'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import ExerciseDetailView from './ExerciseDetailView.jsx'
import { ProgressRing } from './ProgressSummary.jsx'
import { FEEDBACK_URL } from '../data/feedback.js'
import { workplaceOptions } from '../data/profileOptions.js'

function TodayScreen({
  activeWorkplace,
  completedIds,
  feedbackUrl = FEEDBACK_URL,
  initialDetailIndex = null,
  onComplete,
  onReplaceRecommendation = () => {},
  onWorkplaceChange,
  plan,
  progressSummary,
  replacementMessage = '',
  workplaces,
}) {
  const [selectedDetailIndex, setSelectedDetailIndex] = useState(initialDetailIndex)
  const openSections = plan.dailySchedule.filter(
    (section) => !completedIds.includes(section.id),
  )
  const completedSections = plan.dailySchedule.filter((section) =>
    completedIds.includes(section.id),
  )
  const openCount = openSections.length
  const completedCount = completedSections.length
  const canSwitchWorkplace = workplaces?.length > 1
  const selectedDetailSection =
    selectedDetailIndex === null ? null : plan.dailySchedule[selectedDetailIndex]

  function completeFromDetail(section) {
    setSelectedDetailIndex(null)
    onComplete(section)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Heute
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          Dein Tagesplan für mehr Bewegung.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-blue-50">
          {openCount === 0
            ? 'Alles erledigt für heute. Stark gemacht.'
            : 'Kleine Bewegungsimpulse helfen dir, lange Sitzphasen bewusster zu unterbrechen.'}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <TodayProgressCard
          completedToday={completedCount}
          totalToday={plan.dailySchedule.length}
        />
        <StreakCard streak={progressSummary?.streak ?? 0} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
              Tagesplan
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              Deine Empfehlungen
            </h2>
            {canSwitchWorkplace && (
              <WorkplaceSwitcher
                activeWorkplace={activeWorkplace}
                onWorkplaceChange={onWorkplaceChange}
                workplaces={workplaces}
              />
            )}
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {openCount} offen · {completedSections.length} erledigt
          </p>
        </div>

        {replacementMessage && (
          <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-200">
            {replacementMessage}
          </p>
        )}

        <div className="grid gap-4">
          {plan.dailySchedule.map((section, index) => (
            <DailyScheduleCard
              completed={completedIds.includes(section.id)}
              key={section.id}
              onComplete={() => onComplete(section)}
              onOpenDetails={() => setSelectedDetailIndex(index)}
              section={section}
              stepNumber={index + 1}
            />
          ))}
        </div>
      </section>

      <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:p-5">
        Hinweis: Move at work ersetzt keine medizinische Beratung. Führe
        Bewegungen nur aus, wenn sie sich für dich sicher und angenehm anfühlen.
        Bei Schmerzen, Verletzungen oder gesundheitlichen Einschränkungen brich
        die Übung ab oder frage medizinisches Fachpersonal.
      </p>

      <section className="rounded-2xl border border-dashed border-[#2563eb]/30 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10 sm:p-5">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Du testest gerade eine frühe Version von Move at work. Dein Feedback
          hilft dabei, die App besser an echte Arbeitstage anzupassen.
        </p>
        <a
          href={feedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
        >
          Feedback geben
        </a>
      </section>

      {selectedDetailSection && (
        <ExerciseDetailView
          completed={completedIds.includes(selectedDetailSection.id)}
          key={selectedDetailSection.id}
          onBack={() => setSelectedDetailIndex(null)}
          onComplete={() => completeFromDetail(selectedDetailSection)}
          onReplace={(reason) => onReplaceRecommendation(selectedDetailIndex, reason)}
          section={selectedDetailSection}
        />
      )}
    </div>
  )
}

function WorkplaceSwitcher({ activeWorkplace, onWorkplaceChange, workplaces }) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Arbeitsort heute
      </p>
      <div
        aria-label="Arbeitsort heute auswählen"
        className="flex flex-wrap gap-2"
        role="group"
      >
        {workplaceOptions
          .filter((workplace) => workplaces.includes(workplace.id))
          .map((workplace) => {
            const isActive = activeWorkplace === workplace.id

            return (
              <button
                key={workplace.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onWorkplaceChange(workplace.id)}
                className={`min-h-9 rounded-full px-3 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                }`}
              >
                {workplace.label}
              </button>
            )
          })}
      </div>
    </div>
  )
}

function TodayProgressCard({ completedToday, totalToday }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-4">
        <ProgressRing
          compact
          completedToday={completedToday}
          totalToday={totalToday}
        />
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Heute erledigt
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            {completedToday} von {totalToday}
          </p>
        </div>
      </div>
    </article>
  )
}

function StreakCard({ streak }) {
  const safeStreak = Math.max(streak, 0)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-xl"
        >
          🚀
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Arbeitsstreak
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            {safeStreak} {safeStreak === 1 ? 'Arbeitstag' : 'Arbeitstage'}
          </p>
        </div>
      </div>
    </article>
  )
}

export default TodayScreen
