import AuthPanel from './AuthPanel.jsx'
import ProfileSettings from './ProfileSettings.jsx'
import ReminderSettings from './ReminderSettings.jsx'
import { confirmRestartOnboarding } from './settingsActions.js'
import { FEEDBACK_URL } from '../data/feedback.js'
import {
  normalizeRoutineSettings,
  routineWeekdayOptions,
} from '../utils/progressStorage.js'

function SettingsScreen({
  answers,
  feedbackUrl = FEEDBACK_URL,
  onChangeAnswers,
  onOpenUpgrade = () => {},
  onRoutineSettingsChange = () => {},
  onRestartOnboarding,
  routineSettings,
}) {
  const normalizedRoutineSettings = normalizeRoutineSettings(routineSettings)

  function handleRestartOnboarding() {
    confirmRestartOnboarding(onRestartOnboarding)
  }

  function handleRoutineDayToggle(weekday) {
    const activeWeekdays = normalizedRoutineSettings.activeWeekdays
    const isActive = activeWeekdays.includes(weekday)
    const nextActiveWeekdays = isActive
      ? activeWeekdays.filter((activeWeekday) => activeWeekday !== weekday)
      : [...activeWeekdays, weekday]

    if (!nextActiveWeekdays.length) {
      return
    }

    onRoutineSettingsChange(
      normalizeRoutineSettings({ activeWeekdays: nextActiveWeekdays }),
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Einstellungen
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          Profil und Reminder an einem Ort.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-blue-50">
          Passe deinen Bewegungsplan an und entscheide, ob die App dich während
          des Arbeitstags erinnern soll.
        </p>
      </section>

      <ProfileSettings answers={answers} onChange={onChangeAnswers} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Arbeits-/Lernroutine
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          An welchen Tagen nutzt du Move at work normalerweise?
        </h2>
        <div
          aria-label="Aktive Arbeits- oder Lerntage auswählen"
          className="mt-4 flex flex-wrap gap-2"
          role="group"
        >
          {routineWeekdayOptions.map((weekday) => {
            const isActive = normalizedRoutineSettings.activeWeekdays.includes(
              weekday.id,
            )

            return (
              <button
                aria-pressed={isActive}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/15'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                }`}
                key={weekday.id}
                onClick={() => handleRoutineDayToggle(weekday.id)}
                type="button"
              >
                {weekday.label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Pausentage und nicht ausgewählte Tage brechen deine Routine nicht.
        </p>
      </section>
      <ReminderSettings />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Konto
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Anmeldung vorbereiten
        </h2>
        <AuthPanel />
      </section>
      <section className="rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-5 dark:bg-[#2563eb]/10 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Move at work Plus
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Mehr Freiheit für deinen Tagesplan
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Sieh dir an, was Plus aktuell enthält und welche Funktionen als Nächstes geplant sind.
        </p>
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="mt-4 min-h-11 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
        >
          Plus ansehen
        </button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Feedback
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Feedback zum Praxistest
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Du testest gerade eine frühe Version von Move at work. Dein Feedback
          hilft dabei, die Empfehlungen verständlicher, passender und
          alltagstauglicher zu machen.
        </p>
        <a
          href={feedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
        >
          Feedback geben
        </a>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          Onboarding
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Angaben neu einrichten
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Du möchtest deine Angaben neu einrichten? Starte das Onboarding erneut.
          Dein Fortschritt bleibt erhalten.
        </p>
        <button
          type="button"
          onClick={handleRestartOnboarding}
          className="mt-4 min-h-11 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
        >
          Onboarding neu starten
        </button>
      </section>
    </div>
  )
}

export default SettingsScreen
