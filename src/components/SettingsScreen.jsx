import ProfileSettings from './ProfileSettings.jsx'
import ReminderSettings from './ReminderSettings.jsx'
import { confirmRestartOnboarding } from './settingsActions.js'

function SettingsScreen({ answers, onChangeAnswers, onRestartOnboarding }) {
  function handleRestartOnboarding() {
    confirmRestartOnboarding(onRestartOnboarding)
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
      <ReminderSettings />
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
