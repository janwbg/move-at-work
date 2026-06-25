import { useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { FEEDBACK_URL } from '../data/feedback.js'
import {
  getOptionLabel,
  goalOptions,
  intensityOptions,
  normalizeProfileAnswers,
  updateWorkplaceSetup,
  workplaceOptions,
} from '../data/profileOptions.js'
import { loadPremiumStatus, premiumStatuses } from '../utils/premiumStatus.js'
import {
  loadReminderSettings,
  normalizeReminderSettings,
} from '../utils/reminderStorage.js'
import {
  getNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationService.js'
import AuthPanel from './AuthPanel.jsx'
import ProfileSettings, {
  SetupSettingsScreen,
} from './ProfileSettings.jsx'
import ReminderSettings from './ReminderSettings.jsx'
import { confirmRestartOnboarding } from './settingsActions.js'
import {
  normalizeRoutineSettings,
  routineWeekdayOptions,
} from '../utils/progressStorage.js'

const settingsViews = {
  overview: 'overview',
  profile: 'profile',
  routine: 'routine',
  reminders: 'reminders',
  account: 'account',
  setupOffice: 'setup-office',
  setupHomeoffice: 'setup-homeoffice',
}

function SettingsScreen({
  answers,
  feedbackUrl = FEEDBACK_URL,
  isDark = false,
  onChangeAnswers,
  onOpenUpgrade = () => {},
  onRoutineSettingsChange = () => {},
  onRestartOnboarding,
  onToggleTheme = () => {},
  routineSettings,
}) {
  const auth = useAuth()
  const normalizedAnswers = normalizeProfileAnswers(answers)
  const normalizedRoutineSettings = normalizeRoutineSettings(routineSettings)
  const [activeView, setActiveView] = useState(settingsViews.overview)
  const [reminderSettings, setReminderSettings] = useState(() =>
    normalizeReminderSettings(loadReminderSettings()),
  )
  const [notificationStatus] = useState(() => ({
    permission: getNotificationPermission(),
    supported: isNotificationSupported(),
  }))
  const [premiumStatus] = useState(() => loadPremiumStatus())

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

  function handleSetupToggle(workplace, setupId) {
    onChangeAnswers((current) =>
      updateWorkplaceSetup(current, workplace, setupId),
    )
  }

  function openSetup(workplace) {
    setActiveView(
      workplace === 'homeoffice'
        ? settingsViews.setupHomeoffice
        : settingsViews.setupOffice,
    )
  }

  if (activeView === settingsViews.profile) {
    return (
      <SettingsLayout>
        <ProfileSettings
          answers={normalizedAnswers}
          onBack={() => setActiveView(settingsViews.overview)}
          onChange={onChangeAnswers}
          onEditSetup={openSetup}
        />
      </SettingsLayout>
    )
  }

  if (activeView === settingsViews.setupOffice) {
    return (
      <SettingsLayout>
        <SetupSettingsScreen
          onBack={() => setActiveView(settingsViews.profile)}
          onToggle={(setupId) => handleSetupToggle('office', setupId)}
          setup={normalizedAnswers.workplaceSetups.office}
          workplace="office"
        />
      </SettingsLayout>
    )
  }

  if (activeView === settingsViews.setupHomeoffice) {
    return (
      <SettingsLayout>
        <SetupSettingsScreen
          onBack={() => setActiveView(settingsViews.profile)}
          onToggle={(setupId) => handleSetupToggle('homeoffice', setupId)}
          setup={normalizedAnswers.workplaceSetups.homeoffice}
          workplace="homeoffice"
        />
      </SettingsLayout>
    )
  }

  if (activeView === settingsViews.routine) {
    return (
      <SettingsLayout>
        <RoutineSettingsPanel
          normalizedRoutineSettings={normalizedRoutineSettings}
          onBack={() => setActiveView(settingsViews.overview)}
          onRoutineDayToggle={handleRoutineDayToggle}
        />
      </SettingsLayout>
    )
  }

  if (activeView === settingsViews.reminders) {
    return (
      <SettingsLayout>
        <DetailHeader
          description="Steuere, wann und wie dich Move at work erinnert."
          icon="reminders"
          onBack={() => setActiveView(settingsViews.overview)}
          title="Reminder"
        />
        <ReminderSettings onSettingsChange={setReminderSettings} />
      </SettingsLayout>
    )
  }

  if (activeView === settingsViews.account) {
    return (
      <SettingsLayout>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <DetailHeader
            description="Melde dich an oder sieh dir Move at work Plus an."
            icon="account"
            onBack={() => setActiveView(settingsViews.overview)}
            title="Konto & Plus"
          />
          <AuthPanel />
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="mt-4 min-h-11 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Plus ansehen
          </button>
        </section>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout>
      <section className="space-y-1 pt-1">
        <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
          Einstellungen
        </h1>
        <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          Passe Move at work an deinen Alltag an.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <SettingsCard
          actionLabel="Bearbeiten"
          icon="profile"
          onAction={() => setActiveView(settingsViews.profile)}
          summary={getProfileSummary(normalizedAnswers)}
          title="Dein Profil"
        />
        <SettingsCard
          actionLabel="Bearbeiten"
          icon="routine"
          onAction={() => setActiveView(settingsViews.routine)}
          summary={[getRoutineSummary(normalizedRoutineSettings)]}
          title="Arbeits-/Lernroutine"
        />
        <SettingsCard
          actionLabel="Anpassen"
          icon="reminders"
          onAction={() => setActiveView(settingsViews.reminders)}
          summary={getReminderSummary(reminderSettings, notificationStatus)}
          title="Reminder"
        />
        <SettingsCard
          icon="account"
          summary={[
            auth.isAuthenticated ? 'Angemeldet' : 'Nicht angemeldet',
            premiumStatus === premiumStatuses.plus
              ? 'Plus aktiv'
              : 'Free-Version',
          ]}
          title="Konto & Plus"
          actions={
            <>
              <button
                type="button"
                onClick={() => setActiveView(settingsViews.account)}
                className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
              >
                Anmelden oder Konto erstellen
              </button>
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="min-h-10 rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-teal-700/15 transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Plus ansehen
              </button>
            </>
          }
        />
        <SettingsCard
          icon="feedback"
          summary={[
            'Du testest eine frühe Version von Move at work. Dein Feedback hilft, Empfehlungen verständlicher, passender und alltagstauglicher zu machen.',
          ]}
          title="Feedback zum Praxistest"
          actions={
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
            >
              Feedback geben
            </a>
          }
        />
        <SettingsCard
          icon="setup"
          summary={[
            `Darstellung: ${isDark ? 'Dunkel' : 'Hell'}`,
            'Onboarding neu starten',
            'Fortschritt bleibt erhalten.',
          ]}
          title="Setup"
          actions={
            <>
              <button
                type="button"
                onClick={handleRestartOnboarding}
                className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
              >
                Onboarding neu starten
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
              >
                {isDark ? 'Zu Hell wechseln' : 'Zu Dunkel wechseln'}
              </button>
            </>
          }
        />
      </section>

      <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
        Move at work ersetzt keine medizinische Beratung. Führe Bewegungen nur
        aus, wenn sie sich sicher und angenehm anfühlen. Bei Schmerzen,
        Verletzungen oder gesundheitlichen Einschränkungen brich ab oder frage
        medizinisches Fachpersonal.
      </p>
    </SettingsLayout>
  )
}

function SettingsLayout({ children }) {
  return <div className="mx-auto max-w-4xl space-y-5">{children}</div>
}

function SettingsCard({
  actionLabel,
  actions,
  icon,
  onAction,
  summary,
  title,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-start gap-3">
        <IconBadge name={icon} />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-slate-950 dark:text-white">
            {title}
          </h2>
          <div className="mt-2 space-y-0.5 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            {summary.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions ?? (
          <button
            type="button"
            onClick={onAction}
            className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  )
}

function DetailHeader({ description, icon, onBack, title }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <IconBadge name={icon} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:text-slate-200"
      >
        Zurück
      </button>
    </div>
  )
}

function RoutineSettingsPanel({
  normalizedRoutineSettings,
  onBack,
  onRoutineDayToggle,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
      <DetailHeader
        description="Lege fest, an welchen Tagen Move at work zu deinem Alltag gehört."
        icon="routine"
        onBack={onBack}
        title="Arbeits-/Lernroutine"
      />
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Pausentage und nicht ausgewählte Tage brechen deine Routine nicht.
      </p>
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
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/15'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
              }`}
              key={weekday.id}
              onClick={() => onRoutineDayToggle(weekday.id)}
              type="button"
            >
              {weekday.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function IconBadge({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
      data-testid={`settings-icon-${name}`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {getIconPath(name)}
      </svg>
    </span>
  )
}

function getIconPath(name) {
  if (name === 'profile') {
    return (
      <>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
      </>
    )
  }

  if (name === 'routine') {
    return (
      <>
        <rect height="16" rx="2" width="16" x="4" y="5" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    )
  }

  if (name === 'reminders') {
    return (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    )
  }

  if (name === 'account') {
    return (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path d="M18 4l.7 1.4 1.5.2-1.1 1.1.3 1.5L18 7.5l-1.4.7.3-1.5-1.1-1.1 1.5-.2z" />
      </>
    )
  }

  if (name === 'feedback') {
    return (
      <>
        <path d="M5 5h14v10H8l-3 3z" />
        <path d="M9 9h6M9 12h4" />
      </>
    )
  }

  return (
    <>
      <path d="M12 3v4M12 17v4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M3 12h4M17 12h4M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      <circle cx="12" cy="12" r="3" />
    </>
  )
}

function getProfileSummary(answers) {
  const workplaceLabels = answers.workplaces.map((workplace) =>
    getOptionLabel(workplaceOptions, workplace),
  )

  return [
    `${getOptionLabel(goalOptions, answers.goal)} · ${workplaceLabels.join(' & ')} · ${getOptionLabel(intensityOptions, answers.fitnessLevel)}`,
    `Standard: ${getOptionLabel(workplaceOptions, answers.defaultWorkplace)}`,
  ]
}

function getRoutineSummary(routineSettings) {
  const activeLabels = routineWeekdayOptions
    .filter((weekday) => routineSettings.activeWeekdays.includes(weekday.id))
    .map((weekday) => weekday.label)
  const pauseLabels = routineWeekdayOptions
    .filter((weekday) => !routineSettings.activeWeekdays.includes(weekday.id))
    .map((weekday) => weekday.label)

  if (activeLabels.join(',') === 'Mo,Di,Mi,Do,Fr') {
    return 'Mo-Fr aktiv · Sa/So Pause'
  }

  return `${activeLabels.join(', ')} aktiv · ${pauseLabels.join(', ')} Pause`
}

function getReminderSummary(settings, notificationStatus) {
  const modeLabels = {
    active: 'Aktiv',
    gentle: 'Sanft',
    normal: 'Normal',
  }

  return [
    `${settings.enabled ? 'Aktiv' : 'Aus'} · ${modeLabels[settings.mode]}`,
    `System-Benachrichtigungen ${getSystemNotificationSummary(
      settings,
      notificationStatus,
    )}`,
  ]
}

function getSystemNotificationSummary(settings, notificationStatus) {
  if (!notificationStatus.supported || notificationStatus.permission === 'unsupported') {
    return 'nicht verfügbar'
  }

  if (
    notificationStatus.permission === 'granted' &&
    settings.systemNotificationsEnabled
  ) {
    return 'aktiv'
  }

  return 'aus'
}

export default SettingsScreen
