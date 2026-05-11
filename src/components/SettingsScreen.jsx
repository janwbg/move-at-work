import ProfileSettings from './ProfileSettings.jsx'
import ReminderSettings from './ReminderSettings.jsx'

function SettingsScreen({ answers, onChangeAnswers }) {
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
          Passe deinen Bewegungsplan an und entscheide, ob die App dich waehrend
          des Arbeitstags erinnern soll.
        </p>
      </section>

      <ProfileSettings answers={answers} onChange={onChangeAnswers} />
      <ReminderSettings />
    </div>
  )
}

export default SettingsScreen
